import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Connecting to your new file!
import LandingPage from './views/LandingPage'; // Import your beautiful new landing surface!
import Login from './views/Login';
import AdminApp from './AdminApp';
import RescuerApp from './RescuerApp';
import CitizenApp from './CitizenApp';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true); // New state to control public gateway layer

  // --- SESSION PERSISTENCE ---
  useEffect(() => {
    const storedSession = localStorage.getItem('agapSession');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session?.role) {
          setUserRole(session.role);
          setUser(session.user || null);
          setShowLanding(false); // If a valid session exists, skip public landing page
        }
      } catch (err) {
        console.error('Unable to restore session:', err);
      }
    }
  }, []);

  // --- GLOBAL DATABASE STATES ---
  const [alerts, setAlerts] = useState([]);
  const [teams, setTeams] = useState([]);
  const [logs, setLogs] = useState([]);

  // --- INITIAL DATA FETCH & REAL-TIME SUBSCRIPTIONS ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: alertsData } = await supabase.from('alerts').select('*').order('time', { ascending: false });
      const { data: teamsData } = await supabase.from('teams').select('*').order('id', { ascending: true });
      const { data: logsData } = await supabase.from('logs').select('*').order('date', { ascending: false });
             
      if (alertsData) setAlerts(alertsData);
      if (teamsData) setTeams(teamsData);
      if (logsData) setLogs(logsData);
    };
    fetchInitialData();

    // Subscribe to REAL-TIME changes!
    const channel = supabase.channel('agap-global-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, payload => {
        supabase.from('alerts').select('*').order('time', { ascending: false }).then(({data}) => setAlerts(data || []));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, payload => {
        supabase.from('teams').select('*').order('id', { ascending: true }).then(({data}) => setTeams(data || []));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, payload => {
        supabase.from('logs').select('*').order('date', { ascending: false }).then(({data}) => setLogs(data || []));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- GLOBAL CITIZEN ACTIONS (Writing to Supabase) ---
  const triggerEmergency = async (citizenData, lat, lng) => {
    const newAlert = {
      id: `SOS-${Math.floor(Math.random() * 10000)}`,
      citizen: citizenData.name,
      location: citizenData.address,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      severity: 'Critical',
      type: citizenData.type || 'General SOS',
      lat: lat,
      lng: lng,
      bloodType: citizenData.bloodType,
      allergies: citizenData.allergies,
      conditions: citizenData.conditions
    };
         
    const { error } = await supabase.from('alerts').insert([newAlert]);
    if (error) console.error("Error triggering emergency:", error);
  };

  const cancelEmergency = async (alertId) => {
    await supabase.from('alerts').delete().eq('id', alertId);
         
    const assignedTeam = teams.find(t => t.assignedAlert === alertId);
    if (assignedTeam) {
      await supabase.from('teams').update({ 
         status: 'Available', 
         location: 'Barangay Hall', 
         assignedAlert: null 
       }).eq('id', assignedTeam.id);
    }
  };

  const handleSessionLogin = (role, userData) => {
    const session = { role, user: userData || null };
    localStorage.setItem('agapSession', JSON.stringify(session));
    setUserRole(role);
    setUser(userData || null);
  };

  const handleSessionLogout = () => {
    localStorage.removeItem('agapSession');
    setUserRole(null);
    setUser(null);
    setShowLanding(true); // Return back to public presentation on sign-out
  };

  // --- ROUTING ENGINE ---
  if (!userRole && showLanding) {
    return <LandingPage onEnterPortal={() => setShowLanding(false)} />;
  }
  
  if (!userRole && !showLanding) {
    return <Login onSelectRole={handleSessionLogin} />;
  }

  if (userRole === 'admin') {
    return <AdminApp alerts={alerts} setAlerts={setAlerts} teams={teams} setTeams={setTeams} logs={logs} setLogs={setLogs} user={user} onLogout={handleSessionLogout} />;
  }
  if (userRole === 'rescuer') {
    return <RescuerApp alerts={alerts} setAlerts={setAlerts} teams={teams} setTeams={setTeams} user={user} onLogout={handleSessionLogout} />;
  }
  if (userRole === 'citizen') {
    return <CitizenApp alerts={alerts} teams={teams} user={user} onTriggerEmergency={triggerEmergency} onCancelEmergency={cancelEmergency} onLogout={handleSessionLogout} />;
  }

  return null;
}

export default App;