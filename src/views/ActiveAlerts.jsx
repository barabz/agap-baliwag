import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ActiveAlerts = ({ alerts, teams, onDispatch, onResolve, onCancelDispatch }) => {
  const [selectedAlert, setSelectedAlert] = useState(alerts[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  useEffect(() => {
    if (!alerts.length) {
      setSelectedAlert(null);
      return;
    }

    const updatedAlert = alerts.find(a => a.id === selectedAlert?.id);
    if (updatedAlert && updatedAlert !== selectedAlert) {
      setSelectedAlert(updatedAlert);
      return;
    }

    if (!selectedAlert) {
      setSelectedAlert(alerts[0]);
    }
  }, [alerts, selectedAlert]);

  const filteredAlerts = alerts.filter(alert => 
    alert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.citizen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableTeams = teams.filter(t => t.status === 'Available');

  const handleConfirmDispatch = () => {
    if (selectedTeamId && selectedAlert) {
      onDispatch(selectedAlert.id, selectedTeamId);
      setShowDispatchModal(false);
      setSelectedTeamId(null);
    }
  };

  // Custom icon for the mini-map
  const getAlertIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:20px;height:20px;background:var(--color-danger);border-radius:50%;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.4); animation: blink 1.5s infinite;"></div>
           </div>`,
    iconSize: [0, 0]
  });

  return (
    <div className="split-view" style={{ position: 'relative' }}>
      
      {/* --- DISPATCH SELECTION MODAL --- */}
      {showDispatchModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="data-card fade-in" style={{ width: '400px', padding: '32px', margin: 0, cursor: 'default' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700 }}>Deploy Patrol Team</h3>
            <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>Select an available unit to respond to {selectedAlert?.id}.</p>
            
            {availableTeams.length === 0 ? (
              <div style={{ background: 'var(--status-danger-bg)', color: 'var(--color-danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fecaca', textAlign: 'center' }}>
                <strong>No teams available!</strong><br/>All patrol units are currently deployed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '250px', overflowY: 'auto' }}>
                {availableTeams.map(team => (
                  <div 
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    style={{ 
                      padding: '12px', 
                      border: `2px solid ${selectedTeamId === team.id ? 'var(--color-info)' : 'var(--border)'}`, 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      background: selectedTeamId === team.id ? 'var(--status-info-bg)' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '15px', color: selectedTeamId === team.id ? 'var(--color-info)' : 'var(--text-dark)' }}>{team.name}</strong>
                      <span style={{ fontSize: '11px', background: 'var(--color-success)', color: 'white', padding: '2px 6px', borderRadius: '12px', fontWeight: 'bold' }}>Available</span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lead: {team.leader} • {team.members} Personnel</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {setShowDispatchModal(false); setSelectedTeamId(null);}}>Cancel</button>
              <button 
                className="btn-dark" 
                style={{ flex: 1, justifyContent: 'center', opacity: (!selectedTeamId || availableTeams.length === 0) ? 0.5 : 1 }} 
                disabled={!selectedTeamId || availableTeams.length === 0}
                onClick={handleConfirmDispatch}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LEFT PANEL: QUEUE --- */}
      <div className="list-panel">
        <div className="list-header">
          <div className="list-header-top">
            <h2>Alert Queue ({alerts.length})</h2>
          </div>
          <div className="search-box">
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search ID, Location or Citizen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="list-content">
          {filteredAlerts.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {alerts.length === 0 ? "No active alerts." : "No matching alerts found."}
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`data-card ${selectedAlert?.id === alert.id ? 'active-card' : ''}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="card-top-row">
                  <div className="card-info">
                    <h3>{alert.id}</h3>
                    <p>{alert.type}</p>
                  </div>
                  <div className="progress-block" style={{ width: '100px', padding: '0 10px' }}>
                    <div className={`progress-fill ${alert.status === 'Pending' ? 'bg-red' : 'bg-blue'}`} style={{ width: alert.status === 'Pending' ? '85%' : '100%' }}></div>
                    <span className="progress-text">{alert.status}</span>
                  </div>
                </div>
                <div className="card-details">
                  <span><strong>Citizen:</strong><br/>{alert.citizen}</span>
                  <span style={{ textAlign: 'right' }}><strong>Time:</strong><br/>{alert.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL: TACTICAL DETAILS --- */}
      <div className="detail-panel" style={{ backgroundColor: '#f1f5f9', padding: '20px' }}>
        {selectedAlert ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            
            {/* TOP HEADER */}
            <div className="detail-header" style={{ marginBottom: 0 }}>
              <div className="detail-header-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h1 style={{ color: selectedAlert.status === 'Pending' ? 'var(--color-danger)' : 'var(--text-dark)', margin: 0 }}>
                    {selectedAlert.id}
                  </h1>
                  <span style={{ background: 'var(--color-dark)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {selectedAlert.type.toUpperCase()}
                  </span>
                </div>
                <div className="detail-meta">
                  <span>⏱️ Triggered at {selectedAlert.time}</span>
                  <span style={{ color: selectedAlert.severity === 'Critical' ? 'var(--color-danger)' : 'var(--color-warning)', fontWeight: 'bold' }}>
                    ⚠️ {selectedAlert.severity} Priority
                  </span>
                </div>
              </div>
              <div className="detail-header-right" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {selectedAlert.status === 'Pending' ? (
                  <button className="btn-dark" style={{ padding: '12px 24px', fontSize: '15px', background: 'var(--color-danger)' }} onClick={() => setShowDispatchModal(true)}>
                    Dispatch Team ➔
                  </button>
                ) : (
                  <>
                    <button className="btn-outline" style={{ padding: '12px 24px', fontSize: '15px', borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }} onClick={() => onCancelDispatch(selectedAlert.id)}>
                      Cancel Dispatch
                    </button>
                    <button className="btn-dark" style={{ padding: '12px 24px', fontSize: '15px', background: 'var(--color-success)', borderColor: 'var(--color-success)' }} onClick={() => onResolve(selectedAlert.id)}>
                      ✅ Resolve Incident
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* MIDDLE ROW: MAP & CALLER INFO */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              
              {/* MINI MAP */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', height: '280px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>📍 Incident Coordinates</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedAlert.lat}, {selectedAlert.lng}</span>
                </div>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  {/* We use a key based on the alert ID so the map strictly re-centers when switching alerts! */}
                  <MapContainer key={selectedAlert.id} center={[selectedAlert.lat, selectedAlert.lng]} zoom={16} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                    <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />
                    <Marker position={[selectedAlert.lat, selectedAlert.lng]} icon={getAlertIcon} />
                  </MapContainer>
                </div>
              </div>

              {/* CALLER PROFILE CARD */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Caller Identity</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                    {selectedAlert.citizen.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ fontSize: '16px', display: 'block' }}>{selectedAlert.citizen}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verified Resident</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                    <strong style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedAlert.location}</strong>
                  </div>
                  
                  {/* Render Medical Profiling if present */}
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Medical Intel:</span>
                    {(selectedAlert.bloodType || selectedAlert.allergies) ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ background: 'var(--status-danger-bg)', border: '1px solid #fecaca', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-danger)' }}>BLOOD TYPE</span>
                          <strong style={{ color: 'var(--color-danger)' }}>{selectedAlert.bloodType}</strong>
                        </div>
                        <div style={{ background: '#f1f5f9', border: '1px solid var(--border)', padding: '8px', borderRadius: '6px' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>ALLERGIES</span>
                          <strong>{selectedAlert.allergies || 'None'}</strong>
                        </div>
                        <div style={{ background: '#f1f5f9', border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', gridColumn: 'span 2' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>CONDITIONS</span>
                          <strong>{selectedAlert.conditions || 'None declared'}</strong>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No medical data attached.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: DISPATCH STATUS FEED */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '24px', flex: 1 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Operational Feed</h3>
              
              {selectedAlert.status === 'Dispatched' ? (
                <div style={{ background: 'var(--status-info-bg)', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '32px', background: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>🚓</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#1e3a8a', fontSize: '15px' }}>Team Deployed: {selectedAlert.assignedTeam}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dark)' }}>Command Center has transferred control to the field unit. Team is currently en route to the coordinates provided.</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                   <div style={{ marginTop: '4px' }}>
                    <div className={selectedAlert.severity === 'Critical' ? 'icon-diamond' : 'icon-circle'}></div>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{selectedAlert.severity} Priority Emergency Broadcast</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Distress signal received from {selectedAlert.location} at {selectedAlert.time}. 
                      The system successfully locked onto the citizen's GPS coordinates. 
                      Awaiting immediate command decision to dispatch rescue personnel.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📡</div>
            <p>All alerts cleared. Select an alert from the queue to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveAlerts;  