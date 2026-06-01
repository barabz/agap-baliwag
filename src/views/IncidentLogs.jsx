import React, { useState } from 'react';

const IncidentLogs = ({ logs }) => {
  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Emergency Types');
  const [resolutionFilter, setResolutionFilter] = useState('All Resolutions');
  
  // NEW: Date Range States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // NEW: Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // --- SORTING HANDLER ---
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- ADVANCED MULTI-FILTER & SORT LOGIC ---
  const processedLogs = logs
    .filter((log) => {
      // 1. Check Search Term
      const matchesSearch = 
        log.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.citizen.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Check Dropdowns
      const matchesType = typeFilter === 'All Emergency Types' || log.type === typeFilter;
      const matchesResolution = resolutionFilter === 'All Resolutions' || log.resolution === resolutionFilter;

      // 3. Check Date Range
      let matchesDate = true;
      if (startDate || endDate) {
        const logDate = new Date(log.date);
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // Start of day
          if (logDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // End of day
          if (logDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesType && matchesResolution && matchesDate;
    })
    .sort((a, b) => {
      // Date requires special parsing, strings can be compared directly
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const valA = a[sortConfig.key].toLowerCase();
        const valB = b[sortConfig.key].toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });

  // Helper function to render the sort arrow icon
  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="fade-in" style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg-main)' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700 }}>System Archives & Logs</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Historical record of all cleared incidents and system events.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline">📥 Export to CSV</button>
          <button className="btn-dark">🖨️ Print Report</button>
        </div>
      </div>

      {/* Advanced Filtering Card */}
      <div className="data-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', background: '#ffffff', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Records:</span>
        
        {/* NEW: Date Range Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-dark)', fontFamily: 'inherit' }} 
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-dark)', fontFamily: 'inherit' }} 
          />
        </div>
        
        {/* Type Filter Bind */}
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-dark)', fontFamily: 'inherit', background: 'white' }}
        >
          <option>All Emergency Types</option>
          <option>Medical</option>
          <option>Fire</option>
          <option>Crime / Security</option>
          <option>Disturbance</option>
          <option>General SOS</option>
        </select>
        
        {/* Resolution Filter Bind */}
        <select 
          value={resolutionFilter} 
          onChange={(e) => setResolutionFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-dark)', fontFamily: 'inherit', background: 'white' }}
        >
          <option>All Resolutions</option>
          <option>Resolved</option>
          <option>False Alarm</option>
          <option>Escalated</option>
        </select>
        
        {/* Search Input Bind */}
        <div className="search-box" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search ID or Citizen Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Full-Width Log Archive Table Card */}
      <div className="table-container" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <thead>
              {/* NEW: Clickable Headers for Sorting */}
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th onClick={() => requestSort('id')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>Log ID {getSortIcon('id')}</th>
                <th onClick={() => requestSort('date')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>Date & Time {getSortIcon('date')}</th>
                <th onClick={() => requestSort('citizen')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>Citizen / Caller {getSortIcon('citizen')}</th>
                <th onClick={() => requestSort('type')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>Emergency Type {getSortIcon('type')}</th>
                <th onClick={() => requestSort('team')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>Responding Unit {getSortIcon('team')}</th>
                <th onClick={() => requestSort('resolution')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>Final Resolution {getSortIcon('resolution')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No historical logs found matching your filters.
                  </td>
                </tr>
              ) : (
                processedLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>{log.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-dark)' }}>{log.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700 }}>{log.citizen}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log.type}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', border: '1px solid var(--border)', fontWeight: 600 }}>
                        🚑 {log.team}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: log.resolution === 'Resolved' ? 'var(--color-success)' : log.resolution === 'False Alarm' ? 'var(--color-danger)' : 'var(--color-warning)', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold'
                      }}>
                        {log.resolution === 'Resolved' ? '✅' : log.resolution === 'False Alarm' ? '❌' : '⚠️'} {log.resolution}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>View Details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Showing {processedLogs.length} entries</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-outline" style={{ padding: '6px 12px', opacity: 0.5, cursor: 'not-allowed' }}>Previous</button>
            <button className="btn-dark" style={{ padding: '6px 16px' }}>1</button>
            <button className="btn-outline" style={{ padding: '6px 12px', opacity: 0.5, cursor: 'not-allowed' }}>Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IncidentLogs;