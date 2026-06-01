import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const NavigationMap = ({ mission, status, myTeam }) => {
  // If no mission, fallbacks
  const targetPos = mission ? [mission.lat, mission.lng] : [15.1320, 120.5980];
  const myPos = myTeam ? [myTeam.lat, myTeam.lng] : [15.1413, 120.5888];

  // Calculate the center point between the Rescuer and the Citizen
  const centerLat = (targetPos[0] + myPos[0]) / 2;
  const centerLng = (targetPos[1] + myPos[1]) / 2;

  // --- NEW: STATE FOR REAL ROAD ROUTING ---
  const [routePath, setRoutePath] = useState(null);
  const [etaDistance, setEtaDistance] = useState({ time: '5 min', dist: '1.2 km' });

  // --- NEW: FETCH ROAD ROUTE FROM OSRM ---
  useEffect(() => {
    if (mission && myTeam && status === 'En Route') {
      const fetchRoute = async () => {
        try {
          // OSRM API expects longitude,latitude
          const url = `https://router.project-osrm.org/route/v1/driving/${myPos[1]},${myPos[0]};${targetPos[1]},${targetPos[0]}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.routes && data.routes.length > 0) {
            // 1. Extract the exact road geometry and flip coordinates from [lng, lat] to Leaflet's [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoutePath(coords);

            // 2. Extract real distance and duration
            const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
            const durationMin = Math.round(data.routes[0].duration / 60);
            setEtaDistance({ time: `${durationMin} min`, dist: `${distanceKm} km` });
          }
        } catch (error) {
          console.error("Failed to fetch road route:", error);
          setRoutePath(null); // Will fallback to a straight line
        }
      };
      
      fetchRoute();
    } else {
      setRoutePath(null);
    }
  }, [mission?.lat, mission?.lng, myTeam?.lat, myTeam?.lng, status]);

  // --- CUSTOM MARKERS ---
  const targetIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="font-size:24px; animation: blink 1.5s infinite;">📍</div>
            <div style="background:var(--status-danger);color:white;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:bold;border:1px solid white;">CITIZEN</div>
           </div>`,
    iconSize: [0, 0]
  });

  const rescuerIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:28px;height:28px;background:var(--status-info);border-radius:6px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🚙</div>
            <div style="background:var(--status-info);color:white;font-size:11px;padding:2px 6px;border-radius:4px;font-weight:bold;margin-top:4px;">YOU</div>
           </div>`,
    iconSize: [0, 0]
  });

  return (
    <div className="view-container map-view slide-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      <div className="map-overlay-info" style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexShrink: 0 }}>
        <div className="eta-box" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '120px' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: 'var(--text-primary)' }}>
            {status === 'En Route' ? etaDistance.time : '0 min'}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            {status === 'En Route' ? `${etaDistance.dist} away` : 'At destination'}
          </p>
        </div>
        <div className="directions-box" style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, display: 'flex', alignItems: 'center' }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: '15px', color: status === 'En Route' ? 'var(--text-primary)' : 'var(--status-success)' }}>
            {status === 'En Route' ? '⬆️ Proceed to Citizen location following the highlighted route.' : '📍 You have arrived at the scene.'}
          </p>
        </div>
      </div>
      
      {/* REAL LEAFLET MAP */}
      <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#e2e8f0', zIndex: 1 }}>
        <MapContainer 
          center={[centerLat, centerLng]} 
          zoom={14} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer 
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
/>
          {/* Recenters when myPos or targetPos changes */}
          <MapAutoCenter center={[centerLat, centerLng]} />
          
          {mission && <Marker position={targetPos} icon={targetIcon} />}
          {myTeam && <Marker position={myPos} icon={rescuerIcon} />}

          {/* NEW: Draw the exact Waze-like road route if successfully fetched */}
          {status === 'En Route' && routePath ? (
            <Polyline 
              positions={routePath} 
              color="#3b82f6" 
              weight={6} 
              opacity={0.8} 
            />
          ) : (
            /* Fallback to straight dashed line if OSRM is loading or fails */
            mission && myTeam && status === 'En Route' && (
              <Polyline 
                positions={[myPos, targetPos]} 
                color="var(--status-info)" 
                dashArray="8, 8" 
                weight={4} 
                opacity={0.5} 
              />
            )
          )}
        </MapContainer>
      </div>
    </div>
  );
};

// helper component to recenter the map when props change
const MapAutoCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center)) map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

export default NavigationMap;