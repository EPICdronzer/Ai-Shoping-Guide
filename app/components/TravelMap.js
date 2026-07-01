'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TravelMap({ startCoords, endCoords, routePolyline, routes, activeRouteIndex, viaCoords, onSelectRoute, onSelectCoords }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routesGroupRef = useRef(null);
  const viaMarkersRef = useRef([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current).setView([22.5937, 78.9629], 5); // India center by default
    mapInstanceRef.current = map;

    // Tile Layer (CartoDB Dark Matter fits the app's premium dark mode perfectly!)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Handle map clicks
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      const popupContent = document.createElement('div');
      popupContent.style.padding = '8px';
      popupContent.style.display = 'flex';
      popupContent.style.flexDirection = 'column';
      popupContent.style.gap = '8px';
      popupContent.style.fontFamily = 'Inter, sans-serif';

      const title = document.createElement('div');
      title.innerText = 'Select Location';
      title.style.fontWeight = 'bold';
      title.style.color = '#1e293b';
      title.style.fontSize = '13px';
      title.style.marginBottom = '2px';
      popupContent.appendChild(title);

      const btnStart = document.createElement('button');
      btnStart.innerText = '🚩 Set as Start';
      btnStart.style.padding = '6px 12px';
      btnStart.style.background = '#4f46e5';
      btnStart.style.color = '#fff';
      btnStart.style.border = 'none';
      btnStart.style.borderRadius = '6px';
      btnStart.style.cursor = 'pointer';
      btnStart.style.fontSize = '12px';
      btnStart.style.fontWeight = '600';
      btnStart.style.textAlign = 'left';
      btnStart.style.transition = 'all 0.2s';
      btnStart.onclick = () => {
        onSelectCoords('start', [lat, lng]);
        map.closePopup();
      };
      popupContent.appendChild(btnStart);

      const btnEnd = document.createElement('button');
      btnEnd.innerText = '🏁 Set as Destination';
      btnEnd.style.padding = '6px 12px';
      btnEnd.style.background = '#10b981';
      btnEnd.style.color = '#fff';
      btnEnd.style.border = 'none';
      btnEnd.style.borderRadius = '6px';
      btnEnd.style.cursor = 'pointer';
      btnEnd.style.fontSize = '12px';
      btnEnd.style.fontWeight = '600';
      btnEnd.style.textAlign = 'left';
      btnEnd.style.transition = 'all 0.2s';
      btnEnd.onclick = () => {
        onSelectCoords('end', [lat, lng]);
        map.closePopup();
      };
      popupContent.appendChild(btnEnd);

      L.popup({
        className: 'custom-leaflet-popup'
      })
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Start & End markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const startIcon = L.divIcon({
      html: '<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); text-align: center; cursor: pointer; transform: translate(0px, -10px);">📍</div>',
      className: 'custom-marker-start',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    const endIcon = L.divIcon({
      html: '<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); text-align: center; cursor: pointer; transform: translate(0px, -10px);">🏁</div>',
      className: 'custom-marker-end',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    // Handle Start Marker
    if (startCoords) {
      const [lat, lng] = startCoords;
      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([lat, lng]);
      } else {
        startMarkerRef.current = L.marker([lat, lng], { icon: startIcon }).addTo(map)
          .bindPopup('<b>Start Location</b>');
      }
    } else if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }

    // Handle End Marker
    if (endCoords) {
      const [lat, lng] = endCoords;
      if (endMarkerRef.current) {
        endMarkerRef.current.setLatLng([lat, lng]);
      } else {
        endMarkerRef.current = L.marker([lat, lng], { icon: endIcon }).addTo(map)
          .bindPopup('<b>Destination Location</b>');
      }
    } else if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }

    // Adjust Bounds to fit markers if both present, or pan to one of them
    if (startCoords && endCoords) {
      const bounds = L.latLngBounds([startCoords, endCoords]);
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (startCoords) {
      map.setView(startCoords, 10);
    } else if (endCoords) {
      map.setView(endCoords, 10);
    }

  }, [startCoords, endCoords]);

  // Update Intermediate via stop markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old via markers
    if (viaMarkersRef.current) {
      viaMarkersRef.current.forEach(marker => marker.remove());
    }
    viaMarkersRef.current = [];

    if (viaCoords && viaCoords.length > 0) {
      const markers = [];
      viaCoords.forEach((coords, idx) => {
        if (!coords) return;
        const [lat, lng] = coords;
        const viaIcon = L.divIcon({
          html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); text-align: center; cursor: pointer; transform: translate(0px, -10px); position: relative;">📍<span style="position: absolute; top: -4px; left: 50%; transform: translateX(-50%); font-size: 9px; font-weight: 800; color: #fff; background: #6366f1; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border: 1px solid #fff;">${idx + 1}</span></div>`,
          className: `custom-marker-via-${idx}`,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });
        const marker = L.marker([lat, lng], { icon: viaIcon }).addTo(map)
          .bindPopup(`<b>Stop #${idx + 1}</b>`);
        markers.push(marker);
      });
      viaMarkersRef.current = markers;
    }
  }, [viaCoords]);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up old layer group
    if (routesGroupRef.current) {
      routesGroupRef.current.remove();
      routesGroupRef.current = null;
    }

    const newGroup = L.featureGroup().addTo(map);
    routesGroupRef.current = newGroup;

    if (routes && routes.length > 0) {
      // Loop backwards so the active route polyline is drawn on TOP of alternative routes
      for (let index = routes.length - 1; index >= 0; index--) {
        const route = routes[index];
        const isActive = index === activeRouteIndex;

        if (isActive) {
          // Glow layer for active route
          L.polyline(route.polyline, {
            color: '#c084fc',
            weight: 12,
            opacity: 0.35,
            lineJoin: 'round',
            interactive: false
          }).addTo(newGroup);
        }

        // Base line selection trigger (thicker invisible line for easier click targeting)
        const interactionLine = L.polyline(route.polyline, {
          color: 'transparent',
          weight: 16,
          lineJoin: 'round',
          cursor: 'pointer'
        }).addTo(newGroup);

        // Core visual line
        const visualLine = L.polyline(route.polyline, {
          color: isActive ? '#6366f1' : '#64748b', // Indigo active, Slate alternative
          weight: isActive ? 5 : 4,
          opacity: isActive ? 0.95 : 0.45,
          lineJoin: 'round',
          dashArray: isActive ? null : '8, 8'
        }).addTo(newGroup);

        const routeDurationText = route.duration >= 3600 
          ? `${Math.floor(route.duration / 3600)}h ${Math.round((route.duration % 3600) / 60)}m`
          : `${Math.round(route.duration / 60)}m`;

        const tooltipContent = `<b>Route ${index + 1}</b>${isActive ? ' (Active)' : ''}<br/>🚗 ${route.distance.toFixed(1)} km · ⏱️ ${routeDurationText}`;
        
        visualLine.bindTooltip(tooltipContent, {
          sticky: true,
          className: 'route-tooltip'
        });

        // Click handler on both lines
        const onClickHandler = (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelectRoute) {
            onSelectRoute(index);
          }
        };

        interactionLine.on('click', onClickHandler);
        visualLine.on('click', onClickHandler);
      }

      // Fit bounds to active route
      if (routes[activeRouteIndex]) {
        const bounds = L.polyline(routes[activeRouteIndex].polyline).getBounds();
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    } else if (routePolyline && routePolyline.length > 0) {
      // Single route fallback
      L.polyline(routePolyline, {
        color: '#c084fc',
        weight: 10,
        opacity: 0.35,
        lineJoin: 'round',
        interactive: false
      }).addTo(newGroup);

      L.polyline(routePolyline, {
        color: '#818cf8',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round'
      }).addTo(newGroup);

      const bounds = L.polyline(routePolyline).getBounds();
      map.fitBounds(bounds, { padding: [60, 60] });
    }

    return () => {
      if (routesGroupRef.current) {
        routesGroupRef.current.remove();
        routesGroupRef.current = null;
      }
    };
  }, [routes, activeRouteIndex, routePolyline]);

  return (
    <>
      <style jsx global>{`
        .route-tooltip {
          background: #11101e !important;
          color: #f8fafc !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 8px !important;
          font-family: 'Outfit', 'Inter', sans-serif !important;
          font-size: 11.5px !important;
          padding: 6px 10px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
        }
      `}</style>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
    </>
  );
}
