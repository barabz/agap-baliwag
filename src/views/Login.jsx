import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Import your database connection
import './Login.css';

const Login = ({ onSelectRole }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state!

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check Supabase for a matching username and password
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single(); // We only want one exact match

      if (error || !data) {
        setError('Invalid username or password. Please try again.');
      } else {
        // Success! Log the user in based on their database role
        console.log(`Welcome back, ${data.name}`);
        onSelectRole(data.role, data);
      }
    } catch (err) {
      setError('System error. Could not connect to the database.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to quickly test different roles
  const autoFill = (role) => {
    if (role === 'citizen') {
      setUsername('gabriel');
      setPassword('citizen123');
    } else {
      setUsername(role);
      setPassword(`${role}123`);
    }
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        
        <div className="login-header">
          <span className="login-icon">🚨</span>
          <h2 style={{ fontSize: '32px', letterSpacing: '2px', margin: '12px 0 2px 0', color: '#0f172a', fontWeight: '800' }}>
            AGAP
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 24px 0', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'lowercase' }}>
            automated geolocation & alert platform
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
            Sign in to access your portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message" style={{ background: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #f87171' }}>{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        {/* Development Helper: Quick Auto-fill buttons */}
        <div className="demo-accounts">
          <p>Quick Access</p>
          <div className="demo-buttons">
            <button type="button" onClick={() => autoFill('admin')}>Admin</button>
            <button type="button" onClick={() => autoFill('rescuer')}>Rescuer</button>
            <button type="button" onClick={() => autoFill('citizen')}>Citizen</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;