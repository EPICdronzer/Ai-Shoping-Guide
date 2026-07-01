export async function POST(request) {
  try {
    const body = await request.json();
    let coordsString = '';

    if (body.coordinates && Array.isArray(body.coordinates)) {
      coordsString = body.coordinates.map(([lng, lat]) => `${lng},${lat}`).join(';');
    } else {
      const { startLng, startLat, endLng, endLat } = body;
      if (startLng === undefined || startLat === undefined || endLng === undefined || endLat === undefined) {
        return Response.json({ error: 'Coordinates or Start/End values are required.' }, { status: 400 });
      }
      coordsString = `${startLng},${startLat};${endLng},${endLat}`;
    }

    // List of public, free routing engine endpoints (OSRM schema)
    // 1. OpenStreetMap Germany (extremely reliable and high uptime)
    // 2. OSRM Demo Server (fallback)
    const routeUrls = [
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordsString}?overview=full&geometries=geojson&alternatives=true`,
      `https://router.projectosrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&alternatives=true`
    ];

    let lastError;
    for (const url of routeUrls) {
      try {
        console.log(`OSRM Proxy Fetching from: ${url}`);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          next: { revalidate: 60 } // Next.js cache 60s
        });

        if (res.ok) {
          const data = await res.json();
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            console.log(`✓ Routing success using: ${url}`);
            return Response.json(data);
          } else {
            console.warn(`Routing server returned code: ${data.code} from ${url}`);
          }
        } else {
          console.warn(`Routing server returned status ${res.status} from ${url}`);
        }
      } catch (err) {
        console.warn(`✗ Routing engine failed for ${url}:`, err.message);
        lastError = err;
      }
    }

    // If both engines failed, throw the last exception to trigger fallback on client-side
    throw lastError || new Error('All road routing servers returned error or failed.');

  } catch (error) {
    console.error('OSRM Backend Proxy Error:', error);
    return Response.json({ error: error.message || 'Failed to fetch road route from server.' }, { status: 500 });
  }
}
