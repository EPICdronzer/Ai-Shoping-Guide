import axios from 'axios';

// Haversine distance helper
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request) {
  try {
    const { lat, lng, state } = await request.json();

    console.log(`Live fuel fetch request: lat=${lat}, lng=${lng}, state=${state}`);

    // 1. Fetch live JS dataset from fuelpricetoday.in
    const res = await axios.get('https://www.fuelpricetoday.in/data.js?v=3', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });

    const fileContent = res.data;

    // 2. Parse cities using regular expressions
    const regex = /\{\s*name:\s*"([^"]+)",\s*state:\s*"([^"]+)",\s*lat:\s*([0-9.-]+),\s*lng:\s*([0-9.-]+),\s*petrol:\s*([0-9.]+),\s*diesel:\s*([0-9.]+)\s*\}/g;
    const cities = [];
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
      cities.push({
        name: match[1],
        state: match[2],
        lat: parseFloat(match[3]),
        lng: parseFloat(match[4]),
        petrol: parseFloat(match[5]),
        diesel: parseFloat(match[6])
      });
    }

    console.log(`Parsed ${cities.length} cities from fuelpricetoday.in dataset.`);

    if (cities.length === 0) {
      throw new Error('Failed to parse any city data from remote JS file.');
    }

    let nearestCity = null;
    let minDistance = Infinity;

    // 3. Find closest city using coordinates
    if (lat !== undefined && lng !== undefined) {
      cities.forEach(city => {
        const dist = getDistance(lat, lng, city.lat, city.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCity = city;
        }
      });
    }

    // If a city is found within 120km, use it!
    if (nearestCity && minDistance <= 120) {
      console.log(`Matched closest city: ${nearestCity.name} (${minDistance.toFixed(1)} km away). Petrol: ${nearestCity.petrol}, Diesel: ${nearestCity.diesel}`);
      return Response.json({
        success: true,
        source: 'fuelpricetoday.in',
        cityName: nearestCity.name,
        stateName: nearestCity.state,
        distance: minDistance,
        petrol: nearestCity.petrol,
        diesel: nearestCity.diesel
      });
    }

    // 4. Fallback: Search matching state name
    if (state) {
      const stateLower = state.toLowerCase().trim();
      const stateMatch = cities.find(city => city.state.toLowerCase().includes(stateLower) || stateLower.includes(city.state.toLowerCase()));
      if (stateMatch) {
        console.log(`Fallback matched state city: ${stateMatch.name} in ${stateMatch.state}. Petrol: ${stateMatch.petrol}, Diesel: ${stateMatch.diesel}`);
        return Response.json({
          success: true,
          source: 'fuelpricetoday.in (state fallback)',
          cityName: stateMatch.name,
          stateName: stateMatch.state,
          petrol: stateMatch.petrol,
          diesel: stateMatch.diesel
        });
      }
    }

    // 5. Ultimate Fallback (Delhi prices)
    const delhiFallback = cities.find(city => city.name === 'New Delhi') || cities[0];
    return Response.json({
      success: true,
      source: 'fuelpricetoday.in (default fallback)',
      cityName: delhiFallback.name,
      stateName: delhiFallback.state,
      petrol: delhiFallback.petrol,
      diesel: delhiFallback.diesel
    });

  } catch (error) {
    console.error('Live Fuel Price Scraping Error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to fetch live fuel prices.'
    }, { status: 500 });
  }
}
