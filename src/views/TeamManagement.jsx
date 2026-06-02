import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TeamManagement = ({ teams, onAddTeam, onUpdateTeam, onDeleteTeam }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [registeredPersonnel, setRegisteredPersonnel] = useState([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState(true);

  useEffect(() => {
    const loadPersonnel = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role')
        .order('name', { ascending: true });

      if (error) {
        console.error('Failed to load registered personnel:', error);
        setRegisteredPersonnel([]);
      } else {
        setRegisteredPersonnel(data || []);
      }
      setIsLoadingPersonnel(false);
    };

    loadPersonnel();
  }, []);

  // --- Placeholder Tanods (kept for UX fallback) ---
  const PLACEHOLDER_TANODS = [
    { id: 'ph-t1', name: 'Tanod Gomez', role: 'Barangay Tanod' },
    { id: 'ph-t2', name: 'Tanod Ramirez', role: 'Barangay Tanod' },
    { id: 'ph-t3', name: 'Tanod Lim', role: 'Barangay Tanod' },
    { id: 'ph-b1', name: 'BHW David', role: 'Health Worker (BHW)' }
  ];

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',
    leader: null, 
    members: [] 
  });

  // --- DROPDOWN UI STATES ---
  const [leaderSearch, setLeaderSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [showLeaderDrop, setShowLeaderDrop] = useState(false);
  const [showMemberDrop, setShowMemberDrop] = useState(false);

  // --- MODAL HANDLERS ---
  const openCreateModal = () => {
    setFormData({ name: '', leader: null, members: [] });
    setEditingTeamId(null);
    setShowModal(true);
  };

  const openEditModal = (team) => {
    const matchedLeader = team.leaderData || registeredPersonnel.find(p => p.name === team.leader) || null;
    
    setFormData({
      name: team.name,
      leader: matchedLeader,
      members: team.personnelData || [] 
    });
    setEditingTeamId(team.id);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.leader) {
      alert("Please provide a Team Name and assign a Leader.");
      return;
    }

    const payload = {
      name: formData.name,
      leader: formData.leader.name,
      members: formData.members.length + 1, 
      leaderData: formData.leader, 
      personnelData: formData.members 
    };

    if (editingTeamId) {
      onUpdateTeam({ id: editingTeamId, ...payload });
    } else {
      onAddTeam(payload);
    }
    setShowModal(false);
  };

  const handleDisband = () => {
    if(window.confirm(`Are you sure you want to disband ${formData.name}?`)) {
      onDeleteTeam(editingTeamId);
      setShowModal(false);
    }
  };

  const toggleMemberSelection = (person) => {
    const isSelected = formData.members.some(m => m.id === person.id);
    if (isSelected) {
      setFormData(prev => ({ ...prev, members: prev.members.filter(m => m.id !== person.id) }));
    } else {
      setFormData(prev => ({ ...prev, members: [...prev.members, person] }));
    }
  };

  const activePersonnel = registeredPersonnel.filter(p => p.role !== 'citizen' && p.role !== 'admin');
  // Members pool includes live rescuers + placeholder tanods so the dropdown shows names
  const membersPool = [...activePersonnel, ...PLACEHOLDER_TANODS];
  const availableForLeader = activePersonnel.filter(p => !formData.members.some(m => m.id === p.id));
  const availableForMember = membersPool.filter(p => formData.leader?.id !== p.id);

  return (
    <div className="split-view">
      
      {/* --- MODAL OVERLAY --- */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(6px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="data-card fade-in" style={{ width: '440px', padding: '32px', margin: 0, cursor: 'default', overflow: 'visible', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                {editingTeamId ? 'Edit Patrol Team' : 'Assign Patrol Team'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✖</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Name / Shift</label>
                <input 
                  type="text" required placeholder="e.g., Night Shift Patrol A" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>

            <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team Leader / Driver</label>
                <div 
                  onClick={() => { setShowLeaderDrop(!showLeaderDrop); setShowMemberDrop(false); }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s ease' }}
                >
                  <span style={{ color: formData.leader ? 'var(--text-dark)' : 'var(--text-muted)', fontSize: '14px' }}>
                    {formData.leader ? `⭐ ${formData.leader.name} (${formData.leader.role})` : 'Search personnel...'}
                  </span>
                  <span>▼</span>
                </div>

                {showLeaderDrop && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                      <input 
                        type="text" autoFocus placeholder="Type to filter..." value={leaderSearch} onChange={(e) => setLeaderSearch(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none' }}
                      />
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {availableForLeader.filter(p => p.name.toLowerCase().includes(leaderSearch.toLowerCase())).map(person => (
                        <div 
                          key={person.id}
                          onClick={() => { setFormData({...formData, leader: person}); setShowLeaderDrop(false); setLeaderSearch(''); }}
                          style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{person.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{person.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assign Tanods / BHWs ({formData.members.length})</label>
                <div 
                  onClick={() => { setShowMemberDrop(!showMemberDrop); setShowLeaderDrop(false); }}
                  style={{ width: '100%', minHeight: '48px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', transition: 'all 0.2s ease' }}
                >
                  {formData.members.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '4px 0' }}>Search personnel...</span>}
                  
                  {formData.members.map(member => (
                    <span key={member.id} style={{ background: 'var(--status-info-bg)', color: 'var(--status-info)', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {member.name.split(' ')[0]}
                      <span 
                        onClick={(e) => { e.stopPropagation(); toggleMemberSelection(member); }}
                        style={{ cursor: 'pointer', opacity: 0.7, padding: '0 2px' }}
                      >✖</span>
                    </span>
                  ))}
                </div>

                {showMemberDrop && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '6px', marginTop: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                      <input 
                        type="text" autoFocus placeholder="Type to filter..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none' }}
                      />
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {availableForMember.filter(p => p.name.toLowerCase().includes(memberSearch.toLowerCase())).map(person => {
                        const isSelected = formData.members.some(m => m.id === person.id);
                        return (
                          <div 
                            key={person.id}
                            onClick={() => toggleMemberSelection(person)}
                            style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', background: isSelected ? 'var(--status-success-bg)' : 'white' }}
                            onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'}}
                            onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.background = 'white'}}
                          >
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>
                              {isSelected ? '✓ ' : ''}{person.name}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{person.role}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                {editingTeamId ? (
                  <>
                    <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={handleDisband}>Disband Team</button>
                    <button type="submit" className="btn-dark" style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn-dark" style={{ flex: 1, justifyContent: 'center' }}>Assign Team</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

      <div className="list-panel" style={{ width: '100%', borderRight: 'none' }}>
        <div className="list-header">
          <div className="list-header-top">
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>🚓 Patrol & Response Teams</h2>
            <button className="btn-dark" onClick={openCreateModal} style={{ padding: '10px 16px', fontSize: '13px' }}>+ Assign Team</button>
          </div>
        </div>
        
        <div className="list-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', alignContent: 'start', padding: '16px' }}>
          {teams.map(team => (
            <div key={team.id} className="data-card" style={{ position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => openEditModal(team)} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>✏️ Edit</div>
              <div className="card-top-row">
                <div className="card-info" style={{ paddingRight: '40px' }}>
                  <h3>{team.name}</h3>
                  <p>Lead: {team.leader}</p>
                </div>
                <div className="progress-block" style={{ width: '90px' }}>
                  <div className={`progress-fill ${team.status === 'Available' ? 'bg-green' : 'bg-yellow'}`} style={{ width: '100%' }}></div>
                  <span className="progress-text">{team.status}</span>
                </div>
              </div>
              <div className="card-details">
                <span><strong>Location:</strong><br/>{team.location === 'Command Center' ? 'Barangay Hall' : team.location}</span>
                <span style={{ textAlign: 'right' }}><strong>Team Size:</strong><br/>{team.members} Personnel</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
