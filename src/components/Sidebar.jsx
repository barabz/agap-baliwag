import React from 'react';

const Sidebar = ({ currentView, setCurrentView, onLogout }) => {
  return (
    <aside className="side-nav">
      <div className="nav-brand">
        <div className="nav-brand-icon">🚨</div>
        <div className="nav-brand-text">SYS<br/>PORTAL</div>
      </div>
      
      <nav className="nav-menu">
        <div className={`nav-item ${currentView === 'overview' ? 'active' : ''}`} onClick={() => setCurrentView('overview')}>
          <div className="nav-icon">◱</div>
          <div className="nav-text">Dashboard</div>
        </div>
        
        {/* Added the missing Live Map Navigation Link here! */}
        <div className={`nav-item ${currentView === 'map' ? 'active' : ''}`} onClick={() => setCurrentView('map')}>
          <div className="nav-icon">🗺️</div>
          <div className="nav-text">Live Map</div>
        </div>

        <div className={`nav-item ${currentView === 'alerts' ? 'active' : ''}`} onClick={() => setCurrentView('alerts')}>
          <div className="nav-icon">⚡</div>
          <div className="nav-text">Active Alerts</div>
        </div>
        <div className={`nav-item ${currentView === 'teams' ? 'active' : ''}`} onClick={() => setCurrentView('teams')}>
          <div className="nav-icon">⚑</div>
          <div className="nav-text">Squad Management</div>
        </div>
        <div className={`nav-item ${currentView === 'logs' ? 'active' : ''}`} onClick={() => setCurrentView('logs')}>
          <div className="nav-icon">≡</div>
          <div className="nav-text">System Logs</div>
        </div>
      </nav>

      <div className="nav-bottom">
        <div className="nav-item">
          <div className="nav-icon">⚙️</div>
          <div className="nav-text">Settings</div>
        </div>
        <div className="nav-item">
          <div className="nav-icon">🔔</div>
          <div className="nav-text">Notifications</div>
        </div>
        <div className="nav-item" onClick={onLogout} style={{ marginTop: '10px' }}>
          <div className="avatar-icon">B</div>
          <div className="nav-text">Logout Barbz</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;