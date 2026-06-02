import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DashboardOverview = ({ alerts, teams, setCurrentView }) => {
  // --- TACTICAL CALCULATIONS ---
  const pendingAlerts = alerts.filter(a => a.status === 'Pending');
  const dispatchedAlerts = alerts.filter(a => a.status === 'Dispatched');
  const availableTeams = teams.filter(t => t.status === 'Available');
  const deployedTeams = teams.filter(t => t.status === 'Deployed');
  const totalPersonnel = teams.reduce((sum, team) => sum + (team.members || 0), 0);

  // --- EMERGENCY ANALYTICS ---
  const total = alerts.length || 1; // Prevent division by zero
  const medCount = alerts.filter(a => a.type === 'Medical').length;
  const fireCount = alerts.filter(a => a.type === 'Fire').length;
  const crimeCount = alerts.filter(a => a.type.includes('Crime')).length;
  const otherCount = alerts.length - (medCount + fireCount + crimeCount);

  const mapCenter = [15.1413, 120.5888]; // Base Command

  // --- LEAFLET ICONS ---
  const getAlertIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:18px;height:18px;background:var(--color-danger);border-radius:50%;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.4); animation: blink 1.5s infinite;"></div>
           </div>`,
    iconSize: [0, 0]
  });

  const getTeamIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:20px;height:20px;background:var(--color-info);border-radius:6px;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);"></div>
           </div>`,
    iconSize: [0, 0]
  });

  return (
    <div className="fade-in" style={{ padding: '24px', height: '100%', overflowY: 'auto', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: 'var(--text-dark)', fontWeight: 800, letterSpacing: '-0.5px' }}>
            🎯 Command Center Overview
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
            Real-time emergency response analytics • {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div>
          <button className="btn-dark" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)', padding: '12px 20px' }} onClick={() => setCurrentView('alerts')}>
            🚨 Pending: {pendingAlerts.length}
          </button>
        </div>
      </div>

      {/* KPI WIDGETS (KEY PERFORMANCE INDICATORS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div className="data-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-danger)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setCurrentView('alerts')}>
          <div style={{ fontSize: '28px', background: 'rgba(220, 38, 38, 0.1)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🚨</div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pending Alerts</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{pendingAlerts.length}</p>
          </div>
        </div>

        <div className="data-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-warning)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setCurrentView('alerts')}>
          <div style={{ fontSize: '28px', background: 'rgba(234, 88, 12, 0.1)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🚓</div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Active Dispatches</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{dispatchedAlerts.length}</p>
          </div>
        </div>

        <div className="data-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-success)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setCurrentView('teams')}>
          <div style={{ fontSize: '28px', background: 'rgba(5, 150, 105, 0.1)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🛡️</div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Available Squads</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{availableTeams.length}</p>
          </div>
        </div>

        <div className="data-card" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-info)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setCurrentView('teams')}>
          <div style={{ fontSize: '28px', background: 'rgba(2, 132, 199, 0.1)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>👥</div>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>On-Duty Personnel</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{totalPersonnel}</p>
          </div>
        </div>

      </div>

      {/* MIDDLE ROW: MAP + SYSTEM STATUS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* TACTICAL MAP */}
        <div className="data-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '380px', margin: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Live Sector Grid</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: 'var(--color-danger)', borderRadius: '50%' }}></div> SOS Signals</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: 'var(--color-info)', borderRadius: '2px' }}></div> Patrol Units</span>
            </div>
          </div>
          <div style={{ flex: 1, background: '#e2e8f0', position: 'relative', zIndex: 1 }}>
            <MapContainer center={mapCenter} zoom={14} style={{ width: '100%', height: '100%' }} zoomControl={false}>
              <TileLayer 
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
/>
              {alerts.filter(a => a.status !== 'Resolved').map(alert => (
                <Marker key={`alert-${alert.id}`} position={[alert.lat, alert.lng]} icon={getAlertIcon}>
                  <Popup><strong>{alert.id}</strong><br/>{alert.type} ({alert.status})</Popup>
                </Marker>
              ))}
              {teams.map(team => (
                <Marker key={`team-${team.id}`} position={[team.lat, team.lng]} icon={getTeamIcon}>
                  <Popup><strong>{team.name}</strong><br/>{team.status}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* RIGHT SIDEBAR: WEATHER & SYSTEM HEALTH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* LOCAL CONDITIONS */}
          <div className="data-card" style={{ margin: 0, padding: '20px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Area</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>🌤️</span>
              <div>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>34°C</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>Partly Cloudy</p>
              </div>
            </div>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#cbd5e1' }}>📍 <strong>Baliwag, Central Luzon</strong></p>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚠️</span> High Heat Index Advisory
            </div>
          </div>

          {/* SYSTEM HEALTH */}
          <div className="data-card" style={{ margin: 0, padding: '20px', flex: 1 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></div> Sat-Uplink GPS</span>
                <span style={{ color: 'var(--color-success)' }}>Optimal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></div> Citizen Network</span>
                <span style={{ color: 'var(--color-success)' }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }}></div> Radio Comms</span>
                <span style={{ color: 'var(--color-warning)' }}>Intermittent</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM ROW: SPLIT DATA TABLES & ANALYTICS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        
        {/* EMERGENCY BREAKDOWN (ANALYTICS) */}
        <div className="data-card" style={{ margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'white' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Incident Demographics</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'white', flex: 1 }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <span>🚑 Medical ({medCount})</span><span>{Math.round((medCount/total)*100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(medCount/total)*100}%`, height: '100%', background: 'var(--color-info)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <span>🚓 Crime / Security ({crimeCount})</span><span>{Math.round((crimeCount/total)*100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(crimeCount/total)*100}%`, height: '100%', background: 'var(--color-danger)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <span>🔥 Fire ({fireCount})</span><span>{Math.round((fireCount/total)*100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(fireCount/total)*100}%`, height: '100%', background: 'var(--color-warning)' }}></div>
              </div>
            </div>

          </div>
        </div>

        {/* UNRESOLVED ALERTS */}
        <div className="data-card" style={{ margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Unresolved Alerts</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-info)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setCurrentView('alerts')}>View All ➔</span>
          </div>
          <div style={{ padding: '0 20px', maxHeight: '220px', overflowY: 'auto', background: 'white' }}>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No active alerts.</p>
            ) : (
              alerts.slice(0, 4).map(alert => (
                <div key={alert.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-dark)' }}>{alert.type}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{alert.location}</p>
                  </div>
                  <span style={{ 
                    fontSize: '10px', fontWeight: 'bold', padding: '4px 6px', borderRadius: '4px',
                    background: alert.status === 'Pending' ? 'var(--status-danger-bg)' : 'var(--status-info-bg)',
                    color: alert.status === 'Pending' ? 'var(--color-danger)' : 'var(--color-info)' 
                  }}>
                    {alert.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FLEET STATUS PANEL */}
        <div className="data-card" style={{ margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Patrol Fleet</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-info)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setCurrentView('teams')}>Manage ➔</span>
          </div>
          <div style={{ padding: '0 20px', maxHeight: '220px', overflowY: 'auto', background: 'white' }}>
            {teams.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No teams registered.</p>
            ) : (
              teams.map(team => (
                <div key={team.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--text-dark)' }}>{team.name}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Lead: {team.leader}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: team.status === 'Available' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {team.status === 'Available' ? '✅ Available' : '🚓 Deployed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardOverview;
