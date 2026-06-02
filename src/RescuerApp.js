import React, { useState, useEffect } from 'react';
import './RescuerStyles.css';
import { supabase } from './supabaseClient';
import MissionOverview from './views/rescuer/MissionOverview';
import NavigationMap from './views/rescuer/NavigationMap';
import MissionStatus from './views/rescuer/MissionStatus';
import TeamDirectory from './views/rescuer/TeamDirectory';

function RescuerApp({ alerts, setAlerts, teams, setTeams, user, onLogout }) {
  const [currentTab, setCurrentTab] = useState('mission');
  const [missionStatus, setMissionStatus] = useState('En Route');
  const [toastMessage, setToastMessage] = useState('');

  // --- DYNAMIC TEAM DETECTION (derive from logged-in user) ---
  // Prefer matching by leaderData.id or personnelData entries; fallback to name match
  const myTeam = user
    ? teams.find(t => (t.leaderData && t.leaderData.id === user.id) || (t.personnelData && t.personnelData.some(p => p.id === user.id)) || t.leader === user.name)
    : teams.find(t => t.id === 1);

  const activeAlertRecord = alerts.find(a => a.id === myTeam?.assignedAlert);

  const activeMission = activeAlertRecord ? {
    id: activeAlertRecord.id,
    citizen: activeAlertRecord.citizen,
    phone: 'Contact provided on arrival',
    type: activeAlertRecord.type,
    elapsed: 'Just now',
    address: activeAlertRecord.location,
    briefing: `Priority ${activeAlertRecord.severity} emergency. Proceed with caution.`,
    lat: activeAlertRecord.lat,
    lng: activeAlertRecord.lng
  } : null;

  const [teamMembers, setTeamMembers] = useState([]);

  const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (myTeam && myTeam.personnelData) {
      setTeamMembers(myTeam.personnelData.map((p, idx) => ({ id: p.id || idx, name: p.name, role: p.role || 'Rescuer', phone: p.phone || '', status: 'Active', isMe: user && p.id === user.id })));
    } else {
      // fallback placeholder members
      setTeamMembers([
        { id: 1, name: 'Sgt. Reyes', role: 'Team Leader', phone: '0917-123-4567', status: 'Active', isMe: user?.name === 'Sgt. Reyes' },
        { id: 2, name: 'Medic Santos', role: 'Lead Paramedic', phone: '0918-987-6543', status: 'Active', isMe: false },
        { id: 3, name: 'Officer Cruz', role: 'Driver / Security', phone: '0919-555-0198', status: 'Active', isMe: false },
      ]);
    }
  }, [myTeam, user]);

  useEffect(() => {
    if (!activeMission) {
      setMissionStatus('Standby');
      setCurrentTab('mission');
    } else if (missionStatus === 'Standby') {
      setMissionStatus('En Route');
    }
  }, [activeMission, missionStatus]);

  useEffect(() => {
    if (!myTeam?.id || !activeMission || !('geolocation' in navigator)) return;

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const liveLat = position.coords.latitude;
        const liveLng = position.coords.longitude;

        const distanceKm = calculateDistanceKm(liveLat, liveLng, activeMission.lat, activeMission.lng);
        const teamUpdate = { lat: liveLat, lng: liveLng };

        if (distanceKm <= 0.05) { // <= 50 meters
          teamUpdate.status = 'On Scene';
          if (activeAlertRecord?.id) {
            await supabase.from('alerts').update({ status: 'Arrived' }).eq('id', activeAlertRecord.id);
          }
          setMissionStatus('Arrived');
        } else if (myTeam.status !== 'On Scene') {
          teamUpdate.status = 'Deployed';
        }

        const { error } = await supabase.from('teams').update(teamUpdate).eq('id', myTeam.id);
        if (error) {
          console.error('Unable to update rescuer location:', error);
        }
      },
      (err) => {
        console.warn('Rescuer location watch failed:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (id !== null && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [myTeam?.id, activeMission?.id, activeMission?.lat, activeMission?.lng, activeAlertRecord?.id, myTeam?.status]);

  const rescuerInfo = { name: user?.name || teamMembers.find(m => m.isMe)?.name || 'Rescuer', role: myTeam?.leader || 'Team Leader', team: myTeam?.name || 'Alpha Squad' };

  // --- ACTIONS ---
  // NEW: When rescuer changes status, update the global map!
  const handleStatusChange = (newStatus) => {
    setMissionStatus(newStatus);
    
    // Normalize arrival event and update UI + toast
    if ((newStatus === 'Arrived' || newStatus === 'On Scene') && activeAlertRecord && myTeam?.id) {
      setTeams(teams.map(t => 
         t.id === myTeam.id ? { ...t, lat: activeAlertRecord.lat, lng: activeAlertRecord.lng, location: 'On Scene', status: 'On Scene' } : t
      ));
      setToastMessage('You have arrived at the scene – provide aid.');
    }
  };

  // auto-dismiss toast after a short delay
  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleCompleteMission = () => {
    if(activeAlertRecord) {
      setAlerts(alerts.filter(a => a.id !== activeAlertRecord.id));
      if (myTeam?.id) {
        setTeams(teams.map(t => t.id === myTeam.id ? { ...t, status: 'Available', location: 'Command Center', lat: 15.1413, lng: 120.5888, assignedAlert: null } : t));
      }
    }
    setMissionStatus('Standby');
    setCurrentTab('mission');
  };

  // Developer helper: simulate the rescuer moving toward the mission (for QA)
  const simulateApproach = async () => {
    if (!myTeam?.id || !activeMission) return;
    
    // start from current team position (fallback to base)
    const startLat = myTeam.lat || 15.1413;
    const startLng = myTeam.lng || 120.5888;
    
    const steps = 8;
    let step = 0;
    const latStep = (activeMission.lat - startLat) / steps;
    const lngStep = (activeMission.lng - startLng) / steps;

    const iv = setInterval(async () => {
      step += 1;
      const newLat = startLat + latStep * step;
      const newLng = startLng + lngStep * step;

      await supabase.from('teams').update({ lat: newLat, lng: newLng, status: step >= steps ? 'On Scene' : 'Deployed' }).eq('id', myTeam.id);
      
      // also nudge the alert in case client logic depends on DB values
      if (activeAlertRecord?.id) {
        await supabase.from('alerts').update({ lat: activeMission.lat, lng: activeMission.lng }).eq('id', activeAlertRecord.id);
      }

      if (step >= steps) {
        clearInterval(iv);
        // mark arrived in DB so realtime subscriptions pick it up
        if (activeAlertRecord?.id) await supabase.from('alerts').update({ status: 'Arrived' }).eq('id', activeAlertRecord.id);
        setMissionStatus('Arrived');
      }
    }, 700);
  };

  const renderTab = () => {
    switch(currentTab) {
      case 'mission': return <MissionOverview mission={activeMission} setCurrentTab={setCurrentTab} />;
      case 'map': return <NavigationMap mission={activeMission} status={missionStatus} myTeam={myTeam} />;
      case 'status': return <MissionStatus mission={activeMission} status={missionStatus} setStatus={handleStatusChange} onComplete={handleCompleteMission} />;
      case 'team': return <TeamDirectory teamMembers={teamMembers} />;
      default: return <MissionOverview mission={activeMission} setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="rescuer-layout">
      {/* Toast container */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          <div style={{ background: 'linear-gradient(90deg,#10b981,#06b6d4)', color: 'white', padding: '12px 16px', borderRadius: 10, boxShadow: '0 6px 30px rgba(2,6,23,0.35)', minWidth: 240 }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>Arrival</strong>
            <div style={{ fontSize: 13 }}>{toastMessage}</div>
          </div>
        </div>
      )}
      
      <header className="rescuer-header">
        <div className="header-brand">
          <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }}></div>
          <div>
            <h1>🚨 Rescuer Field App</h1>
            <p className="subtitle">{rescuerInfo.team} • {rescuerInfo.role}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="status-indicator" style={{ borderColor: activeMission ? 'rgba(220, 38, 38, 0.3)' : 'rgba(5, 150, 105, 0.3)', background: activeMission ? 'rgba(220, 38, 38, 0.15)' : 'rgba(5, 150, 105, 0.15)', color: activeMission ? 'var(--status-danger)' : 'var(--status-success)', padding: '8px 14px' }}>
            <span className="pulse-dot" style={{ background: activeMission ? 'var(--status-danger)' : 'var(--status-success)' }}></span> 
            {activeMission ? 'Dispatched' : 'Available'}
          </div>
          {onLogout && <button className="btn-outline btn-sm" onClick={onLogout} style={{ padding: '8px 14px', fontSize: '12px' }}>Exit</button>}
          {process.env.NODE_ENV !== 'production' && <button className="btn-outline btn-sm" onClick={simulateApproach} style={{ padding: '8px 14px', fontSize: '12px' }}>Simulate</button>}
        </div>
      </header>

      <main className="rescuer-content">{renderTab()}</main>

      {/* NEW ICON NAVIGATION BAR */}
      <nav className="rescuer-nav">
        <button className={`nav-btn ${currentTab === 'mission' ? 'active' : ''}`} onClick={() => setCurrentTab('mission')}>
          <span style={{ fontSize: '18px', opacity: currentTab === 'mission' ? 1 : 0.6 }}>📋</span>
          <span className="nav-label">Mission</span>
        </button>
        
        {activeMission && (
          <>
            <button className={`nav-btn ${currentTab === 'map' ? 'active' : ''}`} onClick={() => setCurrentTab('map')}>
              <span style={{ fontSize: '18px', opacity: currentTab === 'map' ? 1 : 0.6 }}>🧭</span>
              <span className="nav-label">GPS Nav</span>
            </button>
            <button className={`nav-btn ${currentTab === 'status' ? 'active' : ''}`} onClick={() => setCurrentTab('status')}>
              <span style={{ fontSize: '18px', opacity: currentTab === 'status' ? 1 : 0.6 }}>📡</span>
              <span className="nav-label">Status</span>
            </button>
          </>
        )}
        
        <button className={`nav-btn ${currentTab === 'team' ? 'active' : ''}`} onClick={() => setCurrentTab('team')}>
          <span style={{ fontSize: '18px', opacity: currentTab === 'team' ? 1 : 0.6 }}>👥</span>
          <span className="nav-label">Team</span>
        </button>
      </nav>
    </div>
  );
}

export default RescuerApp;