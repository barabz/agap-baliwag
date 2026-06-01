import React from 'react';

const MissionOverview = ({ mission, setCurrentTab }) => {
  // If the rescuer has no active mission, show the Standby screen
  if (!mission) {
    return (
      <div className="view-container slide-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Unit on Standby</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You are currently available for dispatch. Keep this device active and wait for command center instructions.</p>
      </div>
    );
  }

  // Otherwise, show the dynamic mission data!
  return (
    <div className="view-container slide-in">
      <div className="alert-banner">
        IMMEDIATE DISPATCH REQUIRED: {mission.id}
      </div>
      
      <div className="info-card">
        <div className="card-header">
          <h2>Citizen Details</h2>
        </div>
        <div className="card-body">
          <p className="data-row"><strong>Name:</strong> {mission.citizen}</p>
          <p className="data-row"><strong>Phone:</strong> {mission.phone}</p>
          <p className="data-row"><strong>Type:</strong> {mission.type}</p>
          <p className="data-row text-danger"><strong>Elapsed:</strong> {mission.elapsed}</p>
        </div>
      </div>

      <div className="info-card">
        <div className="card-header">
          <h2>Location</h2>
        </div>
        <div className="card-body">
          <p className="data-row"><strong>Address:</strong> {mission.address}</p>
          <button className="btn-primary full-width" style={{ marginTop: '16px' }} onClick={() => setCurrentTab('map')}>
            Open GPS Navigation
          </button>
        </div>
      </div>

      <div className="info-card">
        <div className="card-header">
          <h2>Briefing</h2>
        </div>
        <div className="card-body" style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p style={{ margin: 0 }}>{mission.briefing}</p>
        </div>
      </div>
    </div>
  );
};

export default MissionOverview;