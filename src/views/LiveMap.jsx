import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LiveMap = ({ alerts, teams }) => {
  const pendingAlerts = alerts.filter(a => a.status === 'Pending');
  const deployedTeams = teams.filter(t => t.status === 'Deployed');

  const mapCenter = [15.1413, 120.5888]; // Angeles Base Command

  // Helper component to recenter map when center changes
  const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center && Array.isArray(center)) {
        map.setView(center, map.getZoom(), { animate: true });
      }
    }, [center, map]);
    return null;
  };

  // --- Custom Leaflet Markers mimicking your exact CSS ---
  const getAlertIcon = (alertId) => L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:24px;height:24px;background:var(--color-danger);border-radius:50%;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.4); animation: blink 1.5s infinite;"></div>
            <div style="background:var(--text-dark);color:white;font-size:11px;padding:4px 8px;border-radius:4px;font-weight:bold;margin-top:6px;white-space:nowrap;">${alertId}</div>
           </div>`,
    iconSize: [0, 0]
  });

  const getTeamIcon = (teamName) => L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:32px;height:32px;background:var(--color-info);border-radius:8px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🚓</div>
            <div style="background:white;color:var(--color-info);border:1px solid var(--color-info);font-size:11px;padding:4px 8px;border-radius:4px;font-weight:bold;margin-top:6px;white-space:nowrap;">${teamName}</div>
           </div>`,
    iconSize: [0, 0]
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
      
      {/* 1. REAL FULLSCREEN LEAFLET MAP */}
      <MapContainer center={mapCenter} zoom={14} style={{ width: '100%', height: '100%', zIndex: 1 }} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />
        <RecenterMap center={deployedTeams.length ? [deployedTeams[0].lat, deployedTeams[0].lng] : mapCenter} />
        
        {/* Render GPS Markers */}
        {pendingAlerts.map(alert => (
          <Marker key={alert.id} position={[alert.lat, alert.lng]} icon={getAlertIcon(alert.id)} />
        ))}

        {deployedTeams.map(team => (
          <Marker key={team.id} position={[team.lat, team.lng]} icon={getTeamIcon(team.name)} />
        ))}
      </MapContainer>

      {/* 2. FLOATING BADGES (TOP LEFT) */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <div className="badge active" style={{ fontSize: '13px', padding: '8px 16px', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '20px' }}>
          ● LIVE OPS TRACKING
        </div>
      </div>

      {/* 3. FLOATING GLASS INTELLIGENCE PANEL (RIGHT SIDE) */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', bottom: '24px', width: '360px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', zIndex: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>Command Map Overview</h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Global view of deployed units & threats.</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-danger)', fontWeight: 700 }}>🚨 Unresolved Incidents ({pendingAlerts.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingAlerts.map(alert => (
                <div key={alert.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px' }}>{alert.id} - {alert.type}</strong>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{alert.severity}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {alert.location}<br/>⏱️ Since {alert.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-info)', fontWeight: 700 }}>🚓 Units in Field ({deployedTeams.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deployedTeams.map(team => (
                <div key={team.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px' }}>{team.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>En Route</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OPR: {team.leader}<br/>DST: {team.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;