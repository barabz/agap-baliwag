import React from 'react';

const TeamDirectory = ({ teamMembers }) => {
  return (
    <div className="view-container slide-in">
      <h2 style={{ fontSize: '24px', margin: '0 0 4px 0', color: '#0f172a' }}>My Squad Directory</h2>
      <p style={{ color: '#64748b', margin: '0 0 24px 0', fontSize: '14px' }}>Contact list and current duty status</p>

      <div className="team-grid">
        {teamMembers.map(member => (
          <div key={member.id} className={`team-member-card ${member.isMe ? 'is-me' : ''}`}>
            <div className="member-avatar">
              {member.name.charAt(0)}
            </div>
            
            <div className="member-details">
              <div className="member-header">
                <h3>{member.name} <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'normal' }}>{member.isMe && '(You)'}</span></h3>
                <span className={`status-dot ${member.status === 'Active' ? 'active' : 'inactive'}`}></span>
              </div>
              <p className="member-role">{member.role}</p>
              <div className="member-contact">
                <span>📞</span>
                <a href={`tel:${member.phone}`}>{member.phone}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamDirectory;