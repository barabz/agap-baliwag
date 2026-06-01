import React, { useState } from 'react';
import './AdminStyles.css';
import Sidebar from './components/Sidebar';
import DashboardOverview from './views/DashboardOverview';
import ActiveAlerts from './views/ActiveAlerts';
import TeamManagement from './views/TeamManagement';
import IncidentLogs from './views/IncidentLogs';
import LiveMap from './views/LiveMap';
import { supabase } from './supabaseClient';

function AdminApp({ alerts, setAlerts, teams, setTeams, logs, setLogs, onLogout }) {
  const [currentView, setCurrentView] = useState('overview');

  // --- DISPATCH ACTIONS ---
  const handleDispatchAlert = async (alertId, teamId) => {
    const alertToDispatch = alerts.find(a => a.id === alertId);
    const selectedTeam = teams.find(t => t.id === teamId);

    if (!alertToDispatch || !selectedTeam) {
      alert('Unable to find selected alert or team. Refresh the page and try again.');
      return;
    }

    if (selectedTeam.status !== 'Available') {
      alert('The selected team is no longer available. Choose another team.');
      return;
    }

    const updatedAlert = {
      status: 'Dispatched',
      assignedTeam: selectedTeam.name
    };

    const updatedTeam = {
      status: 'Deployed',
      location: `En Route to ${alertToDispatch.location}`,
      assignedAlert: alertId
    };

    const { error: alertError } = await supabase.from('alerts').update(updatedAlert).eq('id', alertId);
    const { error: teamError } = await supabase.from('teams').update(updatedTeam).eq('id', teamId);

    if (alertError || teamError) {
      console.error('Dispatch update failed:', alertError || teamError);
      alert('Failed to dispatch the team. Check the console for details.');
      return;
    }

    setAlerts(alerts.map(a => a.id === alertId ? { ...a, ...updatedAlert } : a));
    setTeams(teams.map(t => t.id === teamId ? { ...t, ...updatedTeam } : t));
  };

  const handleResolveAlert = async (alertId) => {
    const alertToResolve = alerts.find(a => a.id === alertId);
    if (!alertToResolve) return;

    const resolvedTeam = teams.find(t => t.assignedAlert === alertId);
    const newLog = {
      id: alertToResolve.id,
      date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      citizen: alertToResolve.citizen,
      type: alertToResolve.type,
      resolution: 'Resolved',
      team: resolvedTeam?.name || 'Command Center'
    };

    const { error: logError } = await supabase.from('logs').insert([newLog]);
    const { error: alertError } = await supabase.from('alerts').delete().eq('id', alertId);
    const { error: teamError } = await supabase.from('teams').update({
      status: 'Available',
      location: 'Command Center',
      lat: 15.1413,
      lng: 120.5888,
      assignedAlert: null
    }).eq('assignedAlert', alertId);

    if (logError || alertError || teamError) {
      console.error('Resolve operation failed:', logError || alertError || teamError);
      alert('Failed to complete resolution. Check the console for details.');
      return;
    }

    setLogs([newLog, ...logs]);
    setAlerts(alerts.filter(a => a.id !== alertId));
    setTeams(teams.map(t => t.assignedAlert === alertId ? { ...t, status: 'Available', location: 'Command Center', lat: 15.1413, lng: 120.5888, assignedAlert: null } : t));
  };

  const handleCancelDispatch = async (alertId) => {
    const alertToCancel = alerts.find(a => a.id === alertId);
    if (!alertToCancel) return;

    const assignedTeam = teams.find(t => t.assignedAlert === alertId);
    const updatedAlert = {
      status: 'Pending',
      assignedTeam: null
    };

    const { error: alertError } = await supabase.from('alerts').update(updatedAlert).eq('id', alertId);
    let teamError = null;
    if (assignedTeam) {
      const result = await supabase.from('teams').update({
        status: 'Available',
        location: 'Command Center',
        assignedAlert: null
      }).eq('id', assignedTeam.id);
      teamError = result.error;
    }

    if (alertError || teamError) {
      console.error('Cancel dispatch failed:', alertError || teamError);
      alert('Failed to cancel the dispatch. Check the console for details.');
      return;
    }

    setAlerts(alerts.map(a => a.id === alertId ? { ...a, ...updatedAlert } : a));
    if (assignedTeam) {
      setTeams(teams.map(t => t.id === assignedTeam.id ? { ...t, status: 'Available', location: 'Command Center', assignedAlert: null } : t));
    }
  };

  // --- TEAM MANAGEMENT ACTIONS ---
  const handleAddTeam = async (newTeam) => {
    const payload = {
      name: newTeam.name,
      leader: newTeam.leader,
      members: newTeam.members,
      status: 'Available',
      location: 'Command Center',
      lat: 15.1413,
      lng: 120.5888,
      assignedAlert: null
    };

    const { data, error } = await supabase.from('teams').insert([payload]).select().single();
    if (error) {
      console.error('Failed to add team:', error);
      alert('Team creation failed. Check the console for details.');
      return;
    }

    setTeams([...teams, { ...payload, id: data.id }]);
  };

  const handleUpdateTeam = async (updatedTeam) => {
    const payload = {
      name: updatedTeam.name,
      leader: updatedTeam.leader,
      members: updatedTeam.members
    };

    const { error, data } = await supabase.from('teams').update(payload).eq('id', updatedTeam.id).select().single();
    if (error) {
      console.error('Failed to update team:', error);
      alert('Team update failed. Check the console for details.');
      return;
    }

    setTeams(teams.map(t => t.id === updatedTeam.id ? { ...t, ...payload, ...data } : t));
  };

  const handleDeleteTeam = async (teamId) => {
    const { error } = await supabase.from('teams').delete().eq('id', teamId);
    if (error) {
      console.error('Failed to delete team:', error);
      alert('Team deletion failed. Check the console for details.');
      return;
    }

    setTeams(teams.filter(t => t.id !== teamId));
  };

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview alerts={alerts} teams={teams} setCurrentView={setCurrentView} />;
      case 'map':
        return <LiveMap alerts={alerts} teams={teams} />;
      case 'alerts':
        return <ActiveAlerts alerts={alerts} teams={teams} onDispatch={handleDispatchAlert} onResolve={handleResolveAlert} onCancelDispatch={handleCancelDispatch} />;
      case 'teams':
        return <TeamManagement teams={teams} onAddTeam={handleAddTeam} onUpdateTeam={handleUpdateTeam} onDeleteTeam={handleDeleteTeam} />;
      case 'logs':
        return <IncidentLogs logs={logs} />;
      default:
        return <DashboardOverview alerts={alerts} teams={teams} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={onLogout} />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderView()}
      </div>
    </div>
  );
}

export default AdminApp;