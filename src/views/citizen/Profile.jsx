import React from 'react';

const Profile = ({ user, onLogout }) => {
  return (
    <div className="slide-up">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.name.charAt(0)}
        </div>
        <h2>{user.name}</h2>
        <p className="verified-badge">Verified Resident</p>
      </div>

      <div className="card info-list" style={{ marginBottom: '16px' }}>
        <div className="info-item">
          <span className="label">Phone Number</span>
          <span className="value">{user.phone}</span>
        </div>
        <div className="info-item" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <span className="label">Registered Address</span>
          <span className="value">{user.address}</span>
        </div>
      </div>

      {/* NEW: Critical Medical Profiling */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Medical Profile</h3>
        <div className="medical-grid">
          <div className="medical-box">
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Blood Type</span>
            <span style={{ color: 'var(--status-danger)', fontWeight: 700 }}>{user.bloodType}</span>
          </div>
          <div className="medical-box">
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Allergies</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.allergies}</span>
          </div>
          <div className="medical-box" style={{ gridColumn: 'span 2' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Chronic Conditions</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.conditions}</span>
          </div>
        </div>
      </div>

      <button className="btn-logout" onClick={onLogout}>
        Sign Out
      </button>
    </div>
  );
};

export default Profile;