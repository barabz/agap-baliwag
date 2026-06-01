import React from 'react';
import './AdminDashboard.css';

// I added 'alerts', 'teams', and 'logs' as props so the dashboard can render live database data.
const AdminDashboard = ({ alerts = [], teams = [], logs = [] }) => {
  // --- DYNAMIC CALCULATIONS ---
  const pendingCount = alerts.filter(a => a.status === 'Pending').length;
  const dispatchingCount = alerts.filter(a => a.status === 'Dispatching' || a.status === 'Dispatched').length;
  
  // Calculate available rescuers dynamically (with a fallback if empty)
  const availableRescuersCount = teams.filter(t => t.status === 'Available').length || 0;
  
  // Calculate resolved logs dynamically (with a fallback if empty)
  const resolvedCount = logs.filter(l => l.resolution === 'Resolved').length || 0;

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="brand">
          <span className="brand-icon">🚨</span>
          <h2>Command Center</h2>
        </div>
        <nav className="nav-menu">
          <a href="#overview" className="nav-link active">📊 Overview</a>
          <a href="#alerts" className="nav-link">⚠️ Active Alerts</a>
          <a href="#teams" className="nav-link">🚑 Rescue Teams</a>
          <a href="#logs" className="nav-link">📁 Incident Logs</a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Navigation */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>General Overview</h1>
            <p>Real-time barangay emergency status</p>
          </div>
          <div className="admin-profile">
            <div className="admin-info">
              <span className="admin-name">Barbz</span>
              <span className="admin-role">System Admin</span>
            </div>
            <div className="admin-avatar">B</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          
          {/* Key Statistics Grid */}
          <div className="stats-grid">
            <div className="stat-card danger">
              <div className="stat-icon">⚠️</div>
              <div className="stat-details">
                <h3>Pending Alerts</h3>
                <p className="stat-number">{pendingCount}</p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">🚑</div>
              <div className="stat-details">
                <h3>Teams Deployed</h3>
                <p className="stat-number">{dispatchingCount}</p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-details">
                <h3>Available Rescuers</h3>
                <p className="stat-number">{availableRescuersCount}</p>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📋</div>
              <div className="stat-details">
                <h3>Resolved Today</h3>
                <p className="stat-number">{resolvedCount}</p>
              </div>
            </div>
          </div>

          {/* System Status / Map Area */}
          <div className="overview-section">
            <div className="overview-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-header" style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                <h3 style={{ margin: 0 }}>Live Sector Map</h3>
                <span className="live-indicator" style={{ color: 'red', fontWeight: 'bold', fontSize: '12px' }}>● LIVE</span>
              </div>
              
              {/* Real OpenStreetMap Integration */}
              <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                <iframe 
                  title="Barangay Map"
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight="0" 
                  marginWidth="0" 
                  src="https://www.openstreetmap.org/export/embed.html?bbox=120.7813%2C14.8214%2C120.8513%2C14.8714&amp;layer=mapnik" 
                  style={{ border: 'none' }}
                ></iframe>
                
                {/* Dynamic Incident Marker - Only shows if there are pending alerts! */}
                {pendingCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '45%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <div style={{ fontSize: '32px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))' }}>🚨</div>
                    <div style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', marginTop: '2px' }}>
                      {pendingCount} PENDING
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;