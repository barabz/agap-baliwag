import React, { useState, useEffect } from 'react';
import './CitizenStyles.css';
import { supabase } from './supabaseClient';
import EmergencyTrigger from './views/citizen/EmergencyTrigger';
import EmergencyStatus from './views/citizen/EmergencyStatus';
import Profile from './views/citizen/Profile';

function CitizenApp({ onLogout, onTriggerEmergency, onCancelEmergency, alerts, teams }) {
  const [currentTab, setCurrentTab] = useState('home');
  
  // NEW: A loading state while we wait for the phone's GPS chip to respond
  const [isGrabbingGPS, setIsGrabbingGPS] = useState(false); 

  const user = {
    name: "Alex Resident",
    phone: "+63 912 999 0000",
    address: "St. Joseph Subd., Phase 2",
    bloodType: "O+",
    allergies: "Penicillin",
    conditions: "Asthma",
    safePin: "1234",
    duressPin: "9999"
  };

  const myAlert = alerts?.find(a => a.citizen === user.name);
  const myTeam = teams?.find(t => t.assignedAlert === myAlert?.id);

  // --- NEW: REAL GPS GEOLOCATION LOGIC ---
  const handleSOS = (category) => {
    setIsGrabbingGPS(true); // Show the loading screen
    const enrichedUserData = { ...user, type: category };

    // Check if the browser supports GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        // SUCCESS: The phone got a GPS lock!
        (position) => {
          const exactLat = position.coords.latitude;
          const exactLng = position.coords.longitude;
          
          // Send the REAL coordinates to the Command Center
          onTriggerEmergency(enrichedUserData, exactLat, exactLng);
          setIsGrabbingGPS(false);
        },
        // ERROR/DENIED: The user clicked "Block" or the phone has no signal
        (error) => {
          console.warn("GPS Error: ", error.message);
          alert("Unable to acquire precise GPS. We will dispatch to your registered home address.");
          
          // Fallback to a default location (e.g., their home address coordinates)
          onTriggerEmergency(enrichedUserData, 15.1320, 120.5980);
          setIsGrabbingGPS(false);
        },
        // GPS Settings: Request high accuracy and wait up to 10 seconds
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Browser doesn't support GPS at all
      alert("GPS not supported by your device. Using registered home address.");
      onTriggerEmergency(enrichedUserData, 15.1320, 120.5980);
      setIsGrabbingGPS(false);
    }
  };

  useEffect(() => {
    if (!myAlert?.id || !('geolocation' in navigator)) return;
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const liveLat = position.coords.latitude;
        const liveLng = position.coords.longitude;
        const { error } = await supabase.from('alerts')
          .update({ lat: liveLat, lng: liveLng })
          .eq('id', myAlert.id);

        if (error) {
          console.error('Unable to update citizen location:', error);
        }
      },
      (err) => {
        console.warn('Citizen location watch failed:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => {
      if (id !== null && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [myAlert?.id]);

  const renderContent = () => {
    if (myAlert) {
      return <EmergencyStatus 
                onCancel={() => onCancelEmergency(myAlert.id)} 
                user={user} 
                // Pass the real coordinates that were saved to the database!
                lat={myAlert.lat} 
                lng={myAlert.lng} 
                myAlert={myAlert}
                myTeam={myTeam}
             />;
    }
    
    // NEW: The loading screen while the phone connects to GPS satellites
    if (isGrabbingGPS) {
      return (
        <div className="trigger-container slide-up" style={{ justifyContent: 'center' }}>
          <div className="pulse-ring" style={{ width: '100px', height: '100px', borderColor: 'var(--status-info)' }}></div>
          <h2 style={{ marginTop: '50px', color: 'var(--status-info)', fontSize: '20px' }}>Acquiring Satellites...</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '250px', fontSize: '13px' }}>
            Please click "Allow" if your browser asks for location permissions.
          </p>
        </div>
      );
    }

    switch (currentTab) {
      case 'home': return <EmergencyTrigger onTrigger={handleSOS} />;
      case 'profile': return <Profile user={user} onLogout={onLogout} />;
      default: return <EmergencyTrigger onTrigger={handleSOS} />;
    }
  };

  return (
    <div className="citizen-layout">
      <header className="citizen-header">
        <div className="header-brand">
          <div style={{ width: 8, height: 8, background: '#09090b', borderRadius: '50%' }}></div>
          <h2>Barangay Rescue</h2>
        </div>
        
        {!myAlert ? (
          <div className="user-greeting">{user.name.split(' ')[0]}</div>
        ) : (
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Switch Role ➔
          </button>
        )}
      </header>

      <main className="citizen-content">{renderContent()}</main>

      {!myAlert && !isGrabbingGPS && (
        <nav className="citizen-nav">
          <button className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`} onClick={() => setCurrentTab('home')}>
            <span style={{ opacity: 0.5 }}>⚡</span><span className="nav-label">Dispatch</span>
          </button>
          <button className={`nav-btn ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}>
            <span style={{ opacity: 0.5 }}>👤</span><span className="nav-label">Profile</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default CitizenApp;