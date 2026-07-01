'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet Map to prevent Next.js SSR build errors
const TravelMap = dynamic(() => import('../components/TravelMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '400px',
      background: 'rgba(10, 8, 28, 0.4)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.05)',
      color: '#94a3b8'
    }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '2rem', display: 'block', animation: 'spin 1s linear infinite' }}>⏳</span>
        <span style={{ fontSize: '14px', marginTop: '10px', display: 'block' }}>Loading Interactive Map...</span>
      </div>
    </div>
  )
});

// Popular Indian car presets for mileage
const POPULAR_CARS = [
  { name: 'Maruti Suzuki WagonR', petrol: 23.5, diesel: null, cng: 26.0 },
  { name: 'Maruti Suzuki Swift', petrol: 22.0, diesel: null, cng: 30.0 },
  { name: 'Hyundai Creta', petrol: 14.0, diesel: 18.0, cng: null },
  { name: 'Tata Nexon', petrol: 17.0, diesel: 22.0, cng: null },
  { name: 'Tata Punch', petrol: 20.0, diesel: null, cng: 27.0 },
  { name: 'Honda City', petrol: 18.4, diesel: null, cng: null },
  { name: 'Toyota Fortuner', petrol: 8.0, diesel: 10.0, cng: null },
  { name: 'Mahindra XUV700', petrol: 12.0, diesel: 14.0, cng: null },
  { name: 'Hyundai i20', petrol: 20.0, diesel: 25.0, cng: null }
];

// Fuel prices for major Indian states/regions (Petrol, Diesel, CNG in INR)
const STATE_FUEL_RATES = {
  'delhi': { petrol: 94.72, diesel: 87.62, cng: 75.09 },
  'nct of delhi': { petrol: 94.72, diesel: 87.62, cng: 75.09 },
  'maharashtra': { petrol: 104.21, diesel: 92.15, cng: 80.00 },
  'karnataka': { petrol: 102.84, diesel: 88.95, cng: 82.00 },
  'tamil nadu': { petrol: 100.75, diesel: 92.34, cng: 80.00 },
  'west bengal': { petrol: 103.94, diesel: 90.76, cng: 87.50 },
  'telangana': { petrol: 107.41, diesel: 95.65, cng: 89.00 },
  'uttar pradesh': { petrol: 94.43, diesel: 87.53, cng: 79.70 },
  'haryana': { petrol: 95.19, diesel: 88.05, cng: 80.00 },
  'rajasthan': { petrol: 104.88, diesel: 90.36, cng: 85.00 },
  'gujarat': { petrol: 94.44, diesel: 90.11, cng: 74.26 },
  'bihar': { petrol: 107.12, diesel: 93.84, cng: 86.00 },
  'madhya pradesh': { petrol: 106.47, diesel: 91.84, cng: 85.00 },
  'punjab': { petrol: 97.47, diesel: 87.83, cng: 85.00 },
  'kerala': { petrol: 107.56, diesel: 96.43, cng: 85.00 },
  'andhra pradesh': { petrol: 109.87, diesel: 97.65, cng: 89.00 },
};

export default function TravelPlanner() {
  // Navigation State
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startCoords, setStartCoords] = useState(null); // [lat, lng]
  const [endCoords, setEndCoords] = useState(null);   // [lat, lng]
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);

  // Intermediate Stops State
  const [viaStops, setViaStops] = useState([]); // Array of { id, query, coords, suggestions: [], showDropdown: false }
  const stopTimersRef = useRef({});

  // Routing Metrics
  const [distance, setDistance] = useState(0); // in km
  const [duration, setDuration] = useState(0); // in seconds
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState('');

  // Fuel Prices (INR) - Defaults typical for India
  const [petrolPrice, setPetrolPrice] = useState(104.2);
  const [dieselPrice, setDieselPrice] = useState(90.3);
  const [cngPrice, setCNGPrice] = useState(80.5);
  const [detectedStateName, setDetectedStateName] = useState('');

  // Vehicle Parameters
  const [selectedCarPreset, setSelectedCarPreset] = useState('');
  const [customCarQuery, setCustomCarQuery] = useState('');
  const [isVehicleSearching, setIsVehicleSearching] = useState(false);
  
  const [petrolMileage, setPetrolMileage] = useState(16.5);
  const [dieselMileage, setDieselMileage] = useState(18.0);
  const [cngMileage, setCNGMileage] = useState(22.0);
  const [isEV, setIsEV] = useState(false);
  const [evRange, setEvRange] = useState(300);

  // Real-world Factors
  const [acActive, setAcActive] = useState(true);
  const [passengersCount, setPassengersCount] = useState(1);

  // Toll Tax Simulation
  const [tollCost, setTollCost] = useState(0);
  const [simulatedTolls, setSimulatedTolls] = useState([]);

  // Search references for clicking outside
  const startSearchRef = useRef(null);
  const endSearchRef = useRef(null);

  // Nominatim Autocomplete debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (startQuery.trim().length >= 3) {
        fetchGeocode(startQuery, 'start');
      } else {
        setStartSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [startQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (endQuery.trim().length >= 3) {
        fetchGeocode(endQuery, 'end');
      } else {
        setEndSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [endQuery]);

  // Click outside listener for autocomplete dropdowns
  useEffect(() => {
    const clickHandler = (e) => {
      if (startSearchRef.current && !startSearchRef.current.contains(e.target)) {
        setShowStartDropdown(false);
      }
      if (endSearchRef.current && !endSearchRef.current.contains(e.target)) {
        setShowEndDropdown(false);
      }
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  // Fetch coordinates for typed address (Nominatim)
  const fetchGeocode = async (query, type) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (type === 'start') {
        setStartSuggestions(data);
        setShowStartDropdown(data.length > 0);
      } else {
        setEndSuggestions(data);
        setShowEndDropdown(data.length > 0);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  const updateFuelPricesFromAddress = async (addressObj, displayName, coords) => {
    let detectedState = '';
    let displayNameState = '';
    
    if (addressObj) {
      if (addressObj.state) {
        detectedState = addressObj.state.toLowerCase().trim();
        displayNameState = addressObj.state;
      } else if (addressObj.state_district) {
        detectedState = addressObj.state_district.toLowerCase().trim();
        displayNameState = addressObj.state_district;
      }
    }
    
    if (!detectedState && displayName) {
      const parts = displayName.split(',');
      for (const part of parts) {
        const trimmed = part.toLowerCase().trim();
        if (STATE_FUEL_RATES[trimmed]) {
          detectedState = trimmed;
          displayNameState = part.trim();
          break;
        }
      }
    }

    // Try fetching live rates from our backend scraper
    try {
      const payload = {
        state: displayNameState || detectedState
      };
      if (coords) {
        payload.lat = coords[0];
        payload.lng = coords[1];
      }
      
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPetrolPrice(data.petrol);
        setDieselPrice(data.diesel);
        setDetectedStateName(`${data.cityName}, ${data.stateName} (Live)`);
        
        // Fallback for CNG price (since data.js only has petrol & diesel)
        let stateCNG = 80.5; // default fallback
        if (detectedState) {
          for (const [stateName, rates] of Object.entries(STATE_FUEL_RATES)) {
            if (detectedState.includes(stateName) || stateName.includes(detectedState)) {
              stateCNG = rates.cng;
              break;
            }
          }
        }
        setCNGPrice(stateCNG);
        return;
      }
    } catch (err) {
      console.error('Failed to load live fuel rates from API, using static fallbacks:', err);
    }

    // Static fallback if API fails
    if (detectedState) {
      let match = null;
      for (const [stateName, rates] of Object.entries(STATE_FUEL_RATES)) {
        if (detectedState.includes(stateName) || stateName.includes(detectedState)) {
          match = rates;
          displayNameState = stateName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }

      if (match) {
        setPetrolPrice(match.petrol);
        setDieselPrice(match.diesel);
        setCNGPrice(match.cng);
        setDetectedStateName(displayNameState);
      }
    }
  };

  // Reverse geocoding for map pin selection
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return null;
    }
  };

  // Click-to-select map pin coordinate callback
  const handleSelectCoordsFromMap = async (type, coords) => {
    const [lat, lng] = coords;
    const geocodeData = await reverseGeocode(lat, lng);
    const addressName = geocodeData ? (geocodeData.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`) : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    if (type === 'start') {
      setStartCoords(coords);
      setStartQuery(addressName);
      setShowStartDropdown(false);
      if (geocodeData && geocodeData.address) {
        updateFuelPricesFromAddress(geocodeData.address, addressName);
      }
    } else {
      setEndCoords(coords);
      setEndQuery(addressName);
      setShowEndDropdown(false);
    }
  };

  // Trigger Routing Calculation via OSRM when start, end, and stops are modified
  useEffect(() => {
    if (startCoords && endCoords) {
      const pendingStops = viaStops.filter(s => s.query.trim().length > 0 && !s.coords);
      if (pendingStops.length === 0) {
        calculateRoute(startCoords, endCoords, viaStops);
      }
    }
  }, [startCoords, endCoords, viaStops]);

  const addViaStop = () => {
    if (viaStops.length >= 3) {
      alert('You can add up to 3 intermediate stops.');
      return;
    }
    setViaStops([...viaStops, { id: Date.now(), query: '', coords: null, suggestions: [], showDropdown: false }]);
  };

  const removeViaStop = (id) => {
    setViaStops(viaStops.filter(stop => stop.id !== id));
  };

  const updateViaStopQuery = (id, val) => {
    setViaStops(viaStops.map(stop => {
      if (stop.id === id) {
        return { ...stop, query: val, showDropdown: true };
      }
      return stop;
    }));
  };

  const fetchStopGeocode = async (id, query) => {
    if (query.trim().length < 3) {
      setViaStops(stops => stops.map(s => s.id === id ? { ...s, suggestions: [] } : s));
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      setViaStops(stops => stops.map(s => s.id === id ? { ...s, suggestions: data, showDropdown: data.length > 0 } : s));
    } catch (err) {
      console.error('Stop geocoding error:', err);
    }
  };

  const handleStopQueryChange = (id, val) => {
    updateViaStopQuery(id, val);
    
    // Clear previous timer for this stop
    if (stopTimersRef.current[id]) {
      clearTimeout(stopTimersRef.current[id]);
    }
    
    // Set new timer
    stopTimersRef.current[id] = setTimeout(() => {
      fetchStopGeocode(id, val);
    }, 500);
  };

  const selectViaStopCoords = (id, item) => {
    const coords = [parseFloat(item.lat), parseFloat(item.lon)];
    setViaStops(viaStops.map(stop => {
      if (stop.id === id) {
        return {
          ...stop,
          query: item.display_name,
          coords: coords,
          suggestions: [],
          showDropdown: false
        };
      }
      return stop;
    }));
  };

  const runFallbackEstimation = (start, end, stops = []) => {
    try {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371; // Earth radius in km
      const points = [start, ...stops.filter(s => s.coords).map(s => s.coords), end];
      let totalEstRoadDist = 0;
      
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        const dLat = toRad(p2[0] - p1[0]);
        const dLon = toRad(p2[1] - p1[1]);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const straightDist = R * c;
        totalEstRoadDist += straightDist * 1.25; // 25% curve overhead
      }

      const fallbackRoute = {
        id: 0,
        distance: totalEstRoadDist,
        duration: Math.round((totalEstRoadDist / 55) * 3600),
        polyline: points
      };

      setRoutesList([fallbackRoute]);
      setActiveRouteIndex(0);
      setDistance(totalEstRoadDist);
      setDuration(fallbackRoute.duration);
      setRoutePolyline(fallbackRoute.polyline);

      // Toll plaza simulation based on estimated distance
      const tollCount = Math.floor(totalEstRoadDist / 80);
      const tolls = [];
      let totalTollCost = 0;
      for (let i = 1; i <= tollCount; i++) {
        const plazaCost = 145;
        totalTollCost += plazaCost;
        tolls.push({
          id: i,
          name: `NH-Highway Toll Plaza #${i} (Estimated)`,
          distanceMark: Math.round(i * 80),
          cost: plazaCost
        });
      }
      setTollCost(totalTollCost);
      setSimulatedTolls(tolls);
    } catch (fallbackErr) {
      console.error('Routing fallback failed:', fallbackErr);
      setRoutesList([]);
      setActiveRouteIndex(0);
      setDistance(0);
      setDuration(0);
      setRoutePolyline([]);
      setTollCost(0);
      setSimulatedTolls([]);
    }
  };

  const calculateRoute = async (start, end, stops = []) => {
    setIsRoutingLoading(true);
    setRoutingError('');
    try {
      const allCoords = [
        [start[1], start[0]],
        ...stops.filter(s => s.coords).map(s => [s.coords[1], s.coords[0]]),
        [end[1], end[0]]
      ];

      // Query the backend OSRM proxy to bypass client CORS blocks
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: allCoords
        })
      });
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        setRoutingError(data.message || 'Route not found. Make sure valid locations are set.');
        runFallbackEstimation(start, end, stops);
        return;
      }

      const formattedRoutes = data.routes.map((route, index) => {
        return {
          id: index,
          distance: route.distance / 1000, // in km
          duration: route.duration, // in seconds
          polyline: route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
        };
      });

      setRoutesList(formattedRoutes);
      setActiveRouteIndex(0);

      const activeRoute = formattedRoutes[0];
      setDistance(activeRoute.distance);
      setDuration(activeRoute.duration);
      setRoutePolyline(activeRoute.polyline);

      // Toll plaza simulation based on highway distance (roughly 1 toll plaza every 80 km)
      const tollCount = Math.floor(activeRoute.distance / 80);
      const tolls = [];
      let totalTollCost = 0;
      for (let i = 1; i <= tollCount; i++) {
        const plazaCost = 145; // average cost in ₹
        totalTollCost += plazaCost;
        tolls.push({
          id: i,
          name: `NH-Highway Toll Plaza #${i}`,
          distanceMark: Math.round(i * 80),
          cost: plazaCost
        });
      }
      setTollCost(totalTollCost);
      setSimulatedTolls(tolls);

    } catch (err) {
      console.error('OSRM Routing Error, falling back to direct estimation:', err);
      runFallbackEstimation(start, end, stops);
      setRoutingError('OSRM routing server is offline or rate-limited. Using direct distance estimation.');
    } finally {
      setIsRoutingLoading(false);
    }
  };

  const handleSelectRoute = (index) => {
    if (index < 0 || index >= routesList.length) return;
    setActiveRouteIndex(index);
    const selectedRoute = routesList[index];
    setDistance(selectedRoute.distance);
    setDuration(selectedRoute.duration);
    setRoutePolyline(selectedRoute.polyline);

    // Re-simulate toll tax plazas for the selected route's distance
    const distKm = selectedRoute.distance;
    const tollCount = Math.floor(distKm / 80);
    const tolls = [];
    let totalTollCost = 0;
    for (let i = 1; i <= tollCount; i++) {
      const plazaCost = 145;
      totalTollCost += plazaCost;
      tolls.push({
        id: i,
        name: `NH-Highway Toll Plaza #${i}`,
        distanceMark: Math.round(i * 80),
        cost: plazaCost
      });
    }
    setTollCost(totalTollCost);
    setSimulatedTolls(tolls);
  };

  // Preset Selection Handler
  const handlePresetCarSelect = (presetName) => {
    setSelectedCarPreset(presetName);
    setCustomCarQuery('');
    
    if (presetName === '') {
      setIsEV(false);
      return;
    }

    const preset = POPULAR_CARS.find(c => c.name === presetName);
    if (preset) {
      setPetrolMileage(preset.petrol || 0);
      setDieselMileage(preset.diesel || 0);
      setCNGMileage(preset.cng || 0);
      setIsEV(false);
    }
  };

  // AI Vehicle specs lookup using Gemini
  const handleAIVehicleSearch = async () => {
    if (!customCarQuery.trim()) return;
    setIsVehicleSearching(true);
    setSelectedCarPreset('');

    try {
      const res = await fetch('/api/vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customCarQuery.trim() })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to fetch specs. Please try again.');
      } else {
        if (data.ev) {
          setIsEV(true);
          setEvRange(data.batteryRange || 300);
          setPetrolMileage(0);
          setDieselMileage(0);
          setCNGMileage(0);
        } else {
          setIsEV(false);
          setPetrolMileage(data.petrol || 0);
          setDieselMileage(data.diesel || 0);
          setCNGMileage(data.cng || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching vehicle specs:', err);
      alert('Network error. Failed to retrieve specs.');
    } finally {
      setIsVehicleSearching(false);
    }
  };

  // Distance formatting helper
  const formatDistance = (dist) => {
    return dist >= 1 ? `${dist.toFixed(1)} km` : `${(dist * 1000).toFixed(0)} meters`;
  };

  // Duration formatting helper
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Real-world factor calculations
  const getEffectiveMileage = (baseMileage) => {
    if (baseMileage <= 0) return 0;
    let factor = 1.0;
    if (acActive) factor *= 0.90; // AC ON: -10% efficiency
    if (passengersCount > 1) {
      factor *= (1 - 0.015 * (passengersCount - 1)); // -1.5% efficiency per extra passenger
    }
    return baseMileage * Math.max(0.5, factor);
  };

  const getEffectiveEVRange = (baseRange) => {
    if (baseRange <= 0) return 0;
    let factor = 1.0;
    if (acActive) factor *= 0.88; // EV AC ON: -12% range
    if (passengersCount > 1) {
      factor *= (1 - 0.015 * (passengersCount - 1)); // -1.5% efficiency per extra passenger
    }
    return baseRange * Math.max(0.5, factor);
  };

  const effectivePetrolMileage = getEffectiveMileage(petrolMileage);
  const effectiveDieselMileage = getEffectiveMileage(dieselMileage);
  const effectiveCNGMileage = getEffectiveMileage(cngMileage);
  const effectiveEVRange = getEffectiveEVRange(evRange);

  // Calculations for fuel consumption and costs
  const calculateFuelDetails = (mileage, fuelPrice) => {
    if (!mileage || mileage <= 0 || distance <= 0) return { quantity: 0, fuelCost: 0, total: 0 };
    const quantity = distance / mileage;
    const fCost = quantity * fuelPrice;
    const totalCost = fCost + tollCost;
    return {
      quantity: quantity.toFixed(1),
      fuelCost: Math.round(fCost),
      total: Math.round(totalCost)
    };
  };

  const petrolStats = calculateFuelDetails(effectivePetrolMileage, petrolPrice);
  const dieselStats = calculateFuelDetails(effectiveDieselMileage, dieselPrice);
  const cngStats = calculateFuelDetails(effectiveCNGMileage, cngPrice);

  // EV Costing Estimation (assuming ₹8.5 per unit/kWh, battery capacity of ~40kWh, range of 300km)
  const calculateEVCost = () => {
    if (!isEV || effectiveEVRange <= 0 || distance <= 0) return { chargingCost: 0, units: 0, total: 0 };
    const avgConsumptionKwhPerKm = 40 / effectiveEVRange; // e.g. 40 kWh for 300km range -> 0.133 kWh/km
    const unitsNeeded = distance * avgConsumptionKwhPerKm;
    const costPerKwh = 8.5; // Average Indian charging cost
    const chargingCost = unitsNeeded * costPerKwh;
    return {
      units: unitsNeeded.toFixed(1),
      chargingCost: Math.round(chargingCost),
      total: Math.round(chargingCost + tollCost)
    };
  };
  const evStats = calculateEVCost();

  // Carbon Emission calculations (based on typical emission rates per fuel consumption)
  // Petrol: ~2.31 kg CO2 per liter consumed
  // Diesel: ~2.68 kg CO2 per liter consumed
  // CNG: ~1.63 kg CO2 per kg consumed
  // EV: Zero tailpipe emissions
  const petrolCO2 = effectivePetrolMileage > 0 ? (distance / effectivePetrolMileage) * 2.31 : 0;
  const dieselCO2 = effectiveDieselMileage > 0 ? (distance / effectiveDieselMileage) * 2.68 : 0;
  const cngCO2 = effectiveCNGMileage > 0 ? (distance / effectiveCNGMileage) * 1.63 : 0;

  // Stops Recommendation logic
  const getPitstops = () => {
    if (distance <= 0) return [];
    if (distance < 100) {
      return [{ id: 'single', type: 'Coffee / Break', title: 'Express Drive', desc: 'No rest stops needed for this distance. Keep standard water bottle.' }];
    }
    if (distance >= 100 && distance < 250) {
      return [
        { id: 'stop-1', type: 'Rest Stop', title: 'Midway Fuel & Food Hub', desc: `Located around ${Math.round(distance / 2)} km mark. Perfect for a quick tea break and vehicle check.` }
      ];
    }
    if (distance >= 250 && distance < 500) {
      return [
        { id: 'stop-1', type: 'Rest Stop', title: 'NH Expressway Food Plaza', desc: `Around ${Math.round(distance * 0.33)} km mark. Clean washrooms, multicuisine restaurant.` },
        { id: 'stop-2', type: 'Refuel & Rest', title: 'Highway Oasis / Fuel Station', desc: `Around ${Math.round(distance * 0.66)} km mark. Quick snack point and refueling plaza.` }
      ];
    }
    return [
      { id: 'stop-1', type: 'Rest Stop', title: 'Expessway Breakfast Plaza', desc: `Around 120 km mark. Clean dining options and lounge space.` },
      { id: 'stop-2', type: 'Lunch Break', title: 'Highway Midpoint Tourist Hub', desc: `Around ${Math.round(distance * 0.5)} km mark. Relax, full lunch buffet, and high speed charging/refuel.` },
      { id: 'stop-3', type: 'Evening Coffee', title: 'Scenic Pitstop Cafe', desc: `Around ${Math.round(distance * 0.8)} km mark. Coffee, tea, and quick vehicle inspection.` }
    ];
  };
  const suggestedStops = getPitstops();

  return (
    <>
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" style={{ opacity: 0.15 }} />
        <div className="bg-orb bg-orb-2" style={{ opacity: 0.15 }} />
      </div>
      <div className="bg-grid" aria-hidden="true" />

      <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* HEADER */}
        <header className="header">
          <div className="header-brand">
            <a href="/" className="back-dash-btn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              marginRight: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}>
              🏠 Hub
            </a>
            <div className="bot-avatar" aria-hidden="true">🚗</div>
            <div>
              <div className="header-title">RouteMind AI</div>
              <div className="header-subtitle">
                <span>✦</span> Route dynamics, Fuel comparisons, and Toll planner
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="status-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', borderColor: 'rgba(52,211,153,0.2)' }}>
              Online
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main style={{ flex: 1, padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          
          {/* LEFT COLUMN: Input Panels & Calculations (7 Columns on large, 12 on small) */}
          <section style={{ gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '20px' }} className="travel-left-col">
            
            {/* 1. LOCATION INPUT PANEL */}
            <div style={{
              background: 'rgba(10, 8, 28, 0.55)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Set Your Journey Route
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* START LOCATION INPUT */}
                <div ref={startSearchRef} style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>🚩 START LOCATION</label>
                  <input
                    type="text"
                    placeholder="Enter city or click on map..."
                    value={startQuery}
                    onChange={(e) => {
                      setStartQuery(e.target.value);
                      setShowStartDropdown(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {showStartDropdown && startSuggestions.length > 0 && (
                    <div style={{
                      position: 'relative',
                      marginTop: '8px',
                      background: '#151426',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      zIndex: 10,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      width: '100%'
                    }}>
                      {startSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setStartCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                            setStartQuery(item.display_name);
                            setShowStartDropdown(false);
                            if (item.address) {
                              updateFuelPricesFromAddress(item.address, item.display_name, [parseFloat(item.lat), parseFloat(item.lon)]);
                            }
                          }}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#cbd5e1',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          📍 {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* VIA STOPS INPUTS */}
                {viaStops.map((stop, stopIdx) => (
                  <div key={stop.id} style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(99, 102, 241, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#818cf8' }}>📍 STOP #{stopIdx + 1}</label>
                      <button
                        onClick={() => removeViaStop(stop.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f43f5e',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Remove Stop ✕
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Enter intermediate stop..."
                        value={stop.query}
                        onChange={(e) => handleStopQueryChange(stop.id, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {stop.showDropdown && stop.suggestions && stop.suggestions.length > 0 && (
                      <div style={{
                        position: 'relative',
                        marginTop: '8px',
                        background: '#151426',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        zIndex: 10,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: '100%'
                      }}>
                        {stop.suggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => selectViaStopCoords(stop.id, item)}
                            style={{
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              color: '#cbd5e1',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            📍 {item.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* DESTINATION LOCATION INPUT */}
                <div ref={endSearchRef} style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>🏁 DESTINATION LOCATION</label>
                  <input
                    type="text"
                    placeholder="Enter city or click on map..."
                    value={endQuery}
                    onChange={(e) => {
                      setEndQuery(e.target.value);
                      setShowEndDropdown(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  {showEndDropdown && endSuggestions.length > 0 && (
                    <div style={{
                      position: 'relative',
                      marginTop: '8px',
                      background: '#151426',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      zIndex: 10,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      width: '100%'
                    }}>
                      {endSuggestions.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setEndCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                            setEndQuery(item.display_name);
                            setShowEndDropdown(false);
                          }}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#cbd5e1',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          🏁 {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ADD STOP BUTTON */}
                {viaStops.length < 3 && (
                  <button
                    onClick={addViaStop}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 14px',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px dashed rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      color: '#818cf8',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    }}
                  >
                    ➕ Add Intermediate Stop
                  </button>
                )}

              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '14px', padding: '10px 12px', background: 'rgba(129,140,248,0.06)', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.12)' }}>
                <span style={{ fontSize: '16px' }}>💡</span>
                <span style={{ fontSize: '12.5px', color: '#a5b4fc' }}>
                  <strong>Tip:</strong> You can select pins by double-clicking or single-clicking on the map on the right to set Start/Destination locations directly!
                </span>
              </div>
            </div>

            {/* 2. VEHICLE SPECIFICATION SELECTOR */}
            <div style={{
              background: 'rgba(10, 8, 28, 0.55)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Vehicle Mileage Settings
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }} className="vehicle-selection-grid">
                
                {/* popular cars selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>POPULAR CAR PRESETS</label>
                  <select
                    value={selectedCarPreset}
                    onChange={(e) => handlePresetCarSelect(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: '#151426',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Choose</option>
                    {POPULAR_CARS.map((car, idx) => (
                      <option key={idx} value={car.name}>{car.name}</option>
                    ))}
                  </select>
                </div>

                {/* AI car specifications finder */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>SEARCH CUSTOM CAR SPECIFICATIONS (AI)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="e.g. Honda Civic"
                      value={customCarQuery}
                      onChange={(e) => setCustomCarQuery(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAIVehicleSearch(); }}
                    />
                    <button
                      onClick={handleAIVehicleSearch}
                      disabled={isVehicleSearching || !customCarQuery.trim()}
                      style={{
                        padding: '0 18px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '95px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      {isVehicleSearching ? '⏳...' : '✦ Search'}
                    </button>
                  </div>
                </div>

              </div>

              {/* manual adjustment parameters */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>Mileage Specifications (ARAI averages, edit to customize):</span>
                  {isEV && (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
                      ⚡ EV Selected
                    </span>
                  )}
                </div>
                
                {isEV ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>ESTIMATED ELECTRIC RANGE (KM ON FULL CHARGE)</label>
                      <input
                        type="number"
                        value={evRange}
                        onChange={(e) => setEvRange(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: '13.5px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }} className="mileage-inputs-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>⛽ PETROL (KM/L)</label>
                      <input
                        type="number"
                        placeholder="0 or N/A"
                        value={petrolMileage || ''}
                        onChange={(e) => setPetrolMileage(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: '13.5px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>⛽ DIESEL (KM/L)</label>
                      <input
                        type="number"
                        placeholder="0 or N/A"
                        value={dieselMileage || ''}
                        onChange={(e) => setDieselMileage(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: '13.5px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>⛽ CNG (KM/KG)</label>
                      <input
                        type="number"
                        placeholder="0 or N/A"
                        value={cngMileage || ''}
                        onChange={(e) => setCNGMileage(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: '13.5px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Real-World Factors section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }} className="mileage-inputs-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>❄️ AIR CONDITIONING (AC)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setAcActive(true)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          background: acActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: acActive ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          color: acActive ? '#818cf8' : '#94a3b8',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        AC ON
                      </button>
                      <button
                        onClick={() => setAcActive(false)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          background: !acActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: !acActive ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          color: !acActive ? '#34d399' : '#94a3b8',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        AC OFF
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px' }}>👥 PASSENGERS (INC. DRIVER)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={passengersCount}
                        onChange={(e) => setPassengersCount(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                          width: '64px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#fff',
                          fontSize: '13.5px',
                          outline: 'none',
                          textAlign: 'center'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {passengersCount === 1 ? (
                          <span>Driver only <br/><span style={{ fontSize: '11px', color: '#64748b' }}>No extra load penalty</span></span>
                        ) : (
                          <span>👥 {passengersCount} occupants <br/><span style={{ fontSize: '11px', color: '#f43f5e' }}>-{((passengersCount - 1) * 1.5).toFixed(1)}% efficiency load penalty</span></span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FUEL PRICE AND COST ANALYSIS CARDS */}
            {distance > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Live Distance Metric Summary */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(16,185,129,0.05))',
                  border: '1px solid rgba(79,70,229,0.2)',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }} className="metrics-banner">
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#a5b4fc', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Planned Journey Statistics</span>
                    <div style={{ display: 'flex', gap: '28px', marginTop: '6px' }} className="metrics-info-row">
                      <div>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{formatDistance(distance)}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Total Road Distance</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{formatDuration(duration)}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Est. Driving Time</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>₹{tollCost}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Simulated Toll Tax</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '2.5rem' }}>🧭</div>
                </div>

                {/* Fuel configuration and card results */}
                <div style={{
                  background: 'rgba(10, 8, 28, 0.55)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }} className="cost-panel-header">
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', display: 'inline-block', marginRight: '10px' }}>
                        Expense & Fuel Breakdown
                      </h2>
                      {detectedStateName && (
                        <span style={{ fontSize: '11px', color: '#818cf8', background: 'rgba(129,140,248,0.1)', padding: '2px 8px', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '10px', fontWeight: '600' }}>
                          📍 Rates: {detectedStateName}
                        </span>
                      )}
                    </div>
                    
                    {/* Inline fuel price editors */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="fuel-price-editors">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#cbd5e1', flexWrap: 'wrap' }}>
                        <span>Petrol:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span>₹</span>
                          <input type="number" step="0.1" value={petrolPrice} onChange={(e) => setPetrolPrice(parseFloat(e.target.value) || 0)} style={{ width: '52px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center', padding: '2px', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#cbd5e1', flexWrap: 'wrap' }}>
                        <span>Diesel:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span>₹</span>
                          <input type="number" step="0.1" value={dieselPrice} onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 0)} style={{ width: '52px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center', padding: '2px', borderRadius: '4px' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#cbd5e1', flexWrap: 'wrap' }}>
                        <span>CNG:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span>₹</span>
                          <input type="number" step="0.1" value={cngPrice} onChange={(e) => setCNGPrice(parseFloat(e.target.value) || 0)} style={{ width: '52px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center', padding: '2px', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARDS GRID */}
                  {isEV ? (
                    /* EV cost presentation card */
                    <div style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      padding: '20px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ color: '#34d399', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          ⚡ Electric Vehicle (EV)
                        </h3>
                        <span style={{ fontSize: '11px', background: '#0f766e', color: '#2dd4bf', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>Most Eco-friendly</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }} className="ev-info-split">
                        <div>
                          <span style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>₹{evStats.total}</span>
                          <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>Total Estimated Cost</span>
                          <div style={{ fontSize: '11px', color: '#a5b4fc', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                            Effective Range: <strong>{effectiveEVRange.toFixed(0)} km</strong> <span style={{ fontSize: '10px', color: '#64748b' }}>({evRange} base)</span>
                          </div>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>⚡ {evStats.units} kWh</span>
                          <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8' }}>Energy Needed</span>
                          <span style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Charging Cost: ₹{evStats.chargingCost}</span>
                        </div>
                      </div>

                      {/* Carbon and visual info */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                          <span style={{ color: '#94a3b8' }}>🍃 Tailpipe Carbon Emissions:</span>
                          <span style={{ color: '#34d399', fontWeight: '700' }}>0.0 kg CO₂ (Zero Direct CO₂)</span>
                        </div>
                        <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }}>
                          <div style={{ width: `${(evStats.chargingCost / evStats.total) * 100}%`, background: '#34d399', height: '100%' }} />
                          <div style={{ width: `${(tollCost / evStats.total) * 100}%`, background: '#f59e0b', height: '100%' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                          <span>Charging: {((evStats.chargingCost / evStats.total) * 100 || 0).toFixed(0)}%</span>
                          <span>Tolls: {((tollCost / evStats.total) * 100 || 0).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Petrol vs Diesel vs CNG comparison */
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }} className="cost-breakdown-cards">
                      
                      {/* PETROL CARD */}
                      <div style={{
                        borderRadius: '12px',
                        background: petrolMileage > 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '18px',
                        opacity: petrolMileage > 0 ? 1 : 0.25,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <h3 style={{ color: '#818cf8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>⛽ Petrol</h3>
                          {petrolMileage > 0 ? (
                            <>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>₹{petrolStats.total}</div>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Est. Cost</span>
                              <div style={{ marginTop: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                                <strong>{petrolStats.quantity} L</strong> fuel needed
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Fuel cost: ₹{petrolStats.fuelCost}</span>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                                Effective: <strong>{effectivePetrolMileage.toFixed(1)} km/L</strong> <span style={{ fontSize: '10px', color: '#64748b' }}>({petrolMileage} base)</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#475569', fontSize: '12px', margin: '20px 0' }}>Not applicable for vehicle</div>
                          )}
                        </div>
                        {petrolMileage > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '14px', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                              <span>CO₂ Impact:</span>
                              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{petrolCO2.toFixed(1)} kg</span>
                            </div>
                            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                              <div style={{ width: `${(petrolStats.fuelCost / petrolStats.total) * 100}%`, background: '#818cf8', height: '100%' }} />
                              <div style={{ width: `${(tollCost / petrolStats.total) * 100}%`, background: '#f59e0b', height: '100%' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* DIESEL CARD */}
                      <div style={{
                        borderRadius: '12px',
                        background: dieselMileage > 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '18px',
                        opacity: dieselMileage > 0 ? 1 : 0.25,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <h3 style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>⛽ Diesel</h3>
                          {dieselMileage > 0 ? (
                            <>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>₹{dieselStats.total}</div>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Est. Cost</span>
                              <div style={{ marginTop: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                                <strong>{dieselStats.quantity} L</strong> fuel needed
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Fuel cost: ₹{dieselStats.fuelCost}</span>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                                Effective: <strong>{effectiveDieselMileage.toFixed(1)} km/L</strong> <span style={{ fontSize: '10px', color: '#64748b' }}>({dieselMileage} base)</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#475569', fontSize: '12px', margin: '20px 0' }}>Not applicable for vehicle</div>
                          )}
                        </div>
                        {dieselMileage > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '14px', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                              <span>CO₂ Impact:</span>
                              <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>{dieselCO2.toFixed(1)} kg</span>
                            </div>
                            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                              <div style={{ width: `${(dieselStats.fuelCost / dieselStats.total) * 100}%`, background: '#a78bfa', height: '100%' }} />
                              <div style={{ width: `${(tollCost / dieselStats.total) * 100}%`, background: '#f59e0b', height: '100%' }} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CNG CARD */}
                      <div style={{
                        borderRadius: '12px',
                        background: cngMileage > 0 ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.01)',
                        border: cngMileage > 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
                        padding: '18px',
                        opacity: cngMileage > 0 ? 1 : 0.25,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ color: '#10b981', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>🌿 CNG</h3>
                            {cngMileage > 0 && <span style={{ fontSize: '9px', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>Best Value</span>}
                          </div>
                          {cngMileage > 0 ? (
                            <>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>₹{cngStats.total}</div>
                              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Est. Cost</span>
                              <div style={{ marginTop: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                                <strong>{cngStats.quantity} kg</strong> fuel needed
                              </div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Fuel cost: ₹{cngStats.fuelCost}</span>
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                                Effective: <strong>{effectiveCNGMileage.toFixed(1)} km/kg</strong> <span style={{ fontSize: '10px', color: '#64748b' }}>({cngMileage} base)</span>
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#475569', fontSize: '12px', margin: '20px 0' }}>Not applicable for vehicle</div>
                          )}
                        </div>
                        {cngMileage > 0 && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '14px', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                              <span>CO₂ Impact:</span>
                              <span style={{ color: '#10b981', fontWeight: 'bold' }}>{cngCO2.toFixed(1)} kg</span>
                            </div>
                            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                              <div style={{ width: `${(cngStats.fuelCost / cngStats.total) * 100}%`, background: '#10b981', height: '100%' }} />
                              <div style={{ width: `${(tollCost / cngStats.total) * 100}%`, background: '#f59e0b', height: '100%' }} />
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Carbon emission advisory comparison */}
                  {!isEV && petrolMileage > 0 && cngMileage > 0 && (
                    <div style={{
                      marginTop: '18px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'rgba(16,185,129,0.05)',
                      border: '1px solid rgba(16,185,129,0.12)',
                      fontSize: '12.5px',
                      color: '#67e8f9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>🍃</span>
                      <span>
                        Choosing <strong>CNG</strong> saves <strong>{Math.round(petrolCO2 - cngCO2)} kg of CO₂</strong> emissions on this trip (approx. <strong>{((1 - cngCO2/petrolCO2)*100).toFixed(0)}% reduction</strong> compared to Petrol).
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. HIGHWAY PIT STOPS RECOMMENDER */}
                <div style={{
                  background: 'rgba(10, 8, 28, 0.55)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Recommended Pitstops & Stops
                  </h2>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                    Recommended breaks along the highway based on route duration to guarantee safe and alert driving:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {suggestedStops.map((stop, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <span style={{ fontSize: '20px', background: 'rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContext: 'center', flexShrink: 0, justifyContent: 'center' }}>
                          {stop.type.includes('Fuel') ? '⛽' : stop.type.includes('Lunch') ? '🍲' : '☕'}
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>{stop.title}</h4>
                            <span style={{ fontSize: '10px', background: 'rgba(129,140,248,0.12)', color: '#818cf8', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' }}>{stop.type}</span>
                          </div>
                          <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>{stop.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* placeholder when route not set yet */
              <div style={{
                background: 'rgba(10, 8, 28, 0.3)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '60px 40px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '14px' }}>🚗</span>
                <h3 style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '600', marginBottom: '6px' }}>No Route Configured</h3>
                <p style={{ fontSize: '13px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                  Please enter start and destination locations in the inputs above, or search/click locations directly on the map to calculate fuel dynamics.
                </p>
              </div>
            )}

          </section>

          {/* RIGHT COLUMN: Interactive Leaflet Map & Toll Simulation (5 Columns on large, 12 on small) */}
          <section style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '20px' }} className="travel-right-col">
            
            {/* INTERACTIVE MAP CONTAINER */}
            <div style={{
              background: 'rgba(10, 8, 28, 0.55)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '16px',
              height: '480px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Interactive Route Map
                </span>
                {isRoutingLoading && (
                  <span style={{ fontSize: '12px', color: '#818cf8', animation: 'pulse 1.5s infinite' }}>
                    ⚡ Calculating Route...
                  </span>
                )}
              </div>

              <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                <TravelMap
                  startCoords={startCoords}
                  endCoords={endCoords}
                  routePolyline={routePolyline}
                  routes={routesList}
                  activeRouteIndex={activeRouteIndex}
                  onSelectRoute={handleSelectRoute}
                  onSelectCoords={handleSelectCoordsFromMap}
                />
              </div>

              {routesList && routesList.length > 1 && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="routes-selector">
                  {routesList.map((route, idx) => {
                    const isActive = idx === activeRouteIndex;
                    const routeDurationText = route.duration >= 3600 
                      ? `${Math.floor(route.duration / 3600)}h ${Math.round((route.duration % 3600) / 60)}m`
                      : `${Math.round(route.duration / 60)}m`;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectRoute(idx)}
                        style={{
                          padding: '8px 14px',
                          background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                          border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '8px',
                          color: isActive ? '#818cf8' : '#cbd5e1',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ color: isActive ? '#818cf8' : '#64748b', fontSize: '10px' }}>
                          {isActive ? '●' : '○'}
                        </span>
                        <span>Route {idx + 1} ({route.distance.toFixed(1)} km · {routeDurationText})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {routingError && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', color: '#f87171' }}>
                  ⚠️ {routingError}
                </div>
              )}
            </div>

            {/* TOLL PLAZAS SIMULATION LIST */}
            {distance > 0 && (
              <div style={{
                background: 'rgba(10, 8, 28, 0.55)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💸 Simulated Toll Plazas ({simulatedTolls.length})
                </h2>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '16px' }}>
                  Expected toll tax plazas encountered during this drive:
                </p>

                {simulatedTolls.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {simulatedTolls.map((toll) => (
                      <div
                        key={toll.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>{toll.name}</div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>At highway milestone {toll.distanceMark} km</span>
                        </div>
                        <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#f59e0b' }}>₹{toll.cost}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic', padding: '10px 0' }}>
                    No toll plazas simulated for this short road distance.
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '16px', paddingTop: '12px', fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                  <span>Total Simulated Tolls:</span>
                  <span style={{ color: '#f59e0b' }}>₹{tollCost}</span>
                </div>
              </div>
            )}

          </section>

        </main>
      </div>

      {/* Media query styling for responsive layouts */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 900px) {
          .travel-left-col, .travel-right-col {
            grid-column: span 12 !important;
          }
          .location-inputs-grid, .vehicle-selection-grid, .mileage-inputs-grid, .cost-breakdown-cards {
            grid-template-columns: 1fr !important;
          }
          .metrics-info-row {
            flex-direction: column;
            gap: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
