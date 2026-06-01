import React from 'react';

const MissionStatus = ({ mission, status, setStatus, onComplete }) => {
  if (!mission) return null;

  return (
    <div className="view-container slide-in">
      <h2 style={{ fontSize: '24px', margin: '0 0 4px 0', color: '#0f172a' }}>Mission Status</h2>
      <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '14px' }}>Keep the Command Center updated.</p>

      <div className="current-status-card">
        <h3>Current System Status</h3>
        <p className="status-display highlight">{status}</p>
      </div>

      <div className="status-actions">
        <button className={`btn-status ${status === 'En Route' ? 'active-status' : ''}`} onClick={() => setStatus('En Route')}>
          🚙 En Route to Scene
        </button>
        <button className={`btn-status ${status === 'Arrived' ? 'active-status' : ''}`} onClick={() => setStatus('Arrived')}>
          📍 Arrived / Provide Aid
        </button>

        <div className="divider"></div>

        <button className="btn-status resolve-btn" onClick={() => {
            if(window.confirm('Are you sure you want to mark this mission as completed?')) {
              onComplete();
            }
          }}>
          ✅ Complete Mission & Reset
        </button>
      </div>
    </div>
  );
};

export default MissionStatus;