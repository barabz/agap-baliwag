import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EmergencyStatus = ({ onCancel, user, lat, lng, myAlert, myTeam }) => {
  const [localStatus, setLocalStatus] = useState('Locating');
  const [activeView, setActiveView] = useState('map');
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Determine actual status based on Global DB
  const displayStatus = myAlert?.status === 'Arrived'
    ? 'Arrived at Location'
    : myAlert?.status === 'Dispatched'
      ? 'Dispatched'
      : localStatus;

  useEffect(() => {
    const locateTimer = setTimeout(() => setLocalStatus('Transmitting'), 1500);
    const pendingTimer = setTimeout(() => setLocalStatus('Pending'), 3000);
    return () => { clearTimeout(locateTimer); clearTimeout(pendingTimer); };
  }, []);

  const citizenIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="font-size:24px; animation: blink 1.5s infinite;">📍</div>
            <div style="background:var(--accent-color);color:white;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:bold;">YOU</div>
           </div>`,
    iconSize: [0, 0]
  });

  // NEW: Dynamic Rescuer Icon for the Citizen Map!
  const rescuerIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
            <div style="width:28px;height:28px;background:var(--status-info);border-radius:6px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">🚓</div>
            <div style="background:var(--status-info);color:white;font-size:11px;padding:2px 6px;border-radius:4px;font-weight:bold;margin-top:4px;">RESCUE</div>
           </div>`,
    iconSize: [0, 0]
  });

  const handleCancelAttempt = () => {
    if (pinInput === user.safePin) {
      alert("Safe PIN accepted. Canceling dispatch.");
      onCancel();
    } else if (pinInput === user.duressPin) {
      alert("DURESS PIN ACCEPTED: The UI will pretend to cancel, but police are still en route.");
      onCancel(); 
    } else {
      alert("Incorrect Security PIN.");
      setPinInput('');
    }
  };

  return (
    <div className="status-container slide-up" style={{ position: 'relative' }}>
      
      {showPinModal && (
        <div className="pin-modal-overlay">
          <div className="pin-modal slide-up">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Security Verification</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Enter your 4-digit PIN to cancel.</p>
            <input 
              type="password" className="pin-input" maxLength="4" placeholder="••••"
              value={pinInput} onChange={(e) => setPinInput(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-cancel" style={{ background: 'var(--bg-hover)' }} onClick={() => {setShowPinModal(false); setPinInput('');}}>Go Back</button>
              <button className="btn-cancel" style={{ background: 'var(--status-danger)', color: 'white' }} onClick={handleCancelAttempt}>Confirm</button>
            </div>
            <p style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>Safe PIN: 1234 | Duress PIN: 9999</p>
          </div>
        </div>
      )}

      <div className="status-header">
        <h2 style={{ color: displayStatus === 'Dispatched' || displayStatus === 'Arrived at Location' ? 'var(--status-success)' : 'var(--status-danger)' }}>
          {displayStatus === 'Locating' && 'Acquiring GPS...'}
          {displayStatus === 'Transmitting' && 'Sending Alert...'}
          {displayStatus === 'Pending' && 'Command Center Evaluating...'}
          {displayStatus === 'Dispatched' && 'Help is on the way.'}
          {displayStatus === 'Arrived at Location' && 'Rescuers have arrived.'}
        </h2>
        <p>
          {displayStatus === 'Dispatched' && `Team ${myTeam?.name || 'assigned'} is en route.`}
          {displayStatus === 'Arrived at Location' && `${myTeam?.name || 'Your team'} is on site.`}
          {!['Dispatched', 'Arrived at Location'].includes(displayStatus) && 'Locking your precise coordinates.'}
        </p>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="status-tabs">
          <button className={`tab-btn ${activeView === 'map' ? 'active' : ''}`} onClick={() => setActiveView('map')}>Live Map</button>
          <button className={`tab-btn ${activeView === 'chat' ? 'active' : ''}`} onClick={() => setActiveView('chat')}>Silent Chat</button>
        </div>

        <div style={{ padding: '0 16px 16px 16px' }}>
          
          {/* NEW: Rescue Team Banner */}
          {myTeam && (
             <div style={{ background: 'var(--status-info-bg)', color: '#1e3a8a', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <span style={{ fontSize: '24px' }}>🚓</span>
               <div>
                 <strong style={{ fontSize: '14px' }}>{myTeam.name} Deployed</strong><br/>
                 <span style={{ opacity: 0.8 }}>OPR: {myTeam.leader}</span>
               </div>
             </div>
          )}

          {activeView === 'map' ? (
            <div style={{ width: '100%', height: '220px', borderRadius: '4px', border: '1px solid var(--border-color)', position: 'relative', zIndex: 1 }}>
              <MapContainer center={[lat, lng]} zoom={14} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                <TileLayer 
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
/>
                <Marker position={[lat, lng]} icon={citizenIcon} />
                {/* Dynamically render the Rescuer Marker if one is assigned! */}
                {myTeam && <Marker position={[myTeam.lat, myTeam.lng]} icon={rescuerIcon} />}
              </MapContainer>
            </div>
          ) : (
            <div className="chat-container">
              <div className="chat-history">
                <div className="chat-msg msg-admin">
                  <strong>Command Center</strong><br/>We have your GPS location. Are you safe to type?
                </div>
              </div>
              <div className="chat-input">
                <button style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', marginLeft: 0, marginRight: '8px', borderRadius: '8px' }}>📷</button>
                <input type="text" placeholder="Type silently..." />
                <button>➔</button>
              </div>
            </div>
          )}

          <div className="details-list" style={{ marginTop: '16px' }}>
            <p><strong>Caller:</strong> {user.name}</p>
            <p><strong>Medical:</strong> <span style={{color: 'var(--status-danger)', fontWeight: 'bold'}}>{user.bloodType}</span> | {user.allergies}</p>
          </div>
        </div>
      </div>

      <button className="btn-cancel" onClick={() => setShowPinModal(true)}>Secure Cancel</button>
    </div>
  );
};

export default EmergencyStatus;