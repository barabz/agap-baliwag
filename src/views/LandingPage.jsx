import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onEnterPortal }) => {
  return (
    <div className="landing-container fade-in">
      {/* Navigation Top Bar */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="brand-logo-icon">🚨</span>
          <div>
            <h1>AGAP</h1>
            <p>Automated Geolocation & Alert Platform</p>
          </div>
        </div>
        <button className="landing-nav-btn" onClick={onEnterPortal}>
          Secure Gateway
        </button>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <span className="hero-badge">🚨 Live Emergency System Platform</span>
          <h2>Rapid Response.<br />Real-Time Precision.</h2>
          <p>
            Bridging the gap between citizens in distress and barangay response fleets. 
            Automated tracking coordinates satellite telemetry instantly to minimize situational latency.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={onEnterPortal}>
              Access Platform Portal
            </button>
            <a href="#features" className="btn-hero-secondary">
              Explore Architecture
            </a>
          </div>
        </div>

        {/* Visual Terminal Mockup Wrapper */}
        <div className="hero-mockup-wrapper">
          <div className="terminal-mockup">
            <div className="terminal-header">
              <span className="dot dot-r"></span>
              <span className="dot dot-y"></span>
              <span className="dot dot-g"></span>
              <span className="terminal-title">agap_central_ uplink.sh</span>
            </div>
            <div className="terminal-body">
              <p className="t-green">[OK] Connected to Supabase Cloud Database Cluster Engine...</p>
              <p className="t-blue">[INFO] Tracking Active Patrol Fleet: Deployed Units Online.</p>
              <p className="t-orange">[WARN] Localized Incident Analytics Sync Active.</p>
              <div className="mock-kpi-row">
                <div className="mock-kpi">
                  <span>0 PENDING</span>
                </div>
                <div className="mock-kpi active-fleet">
                  <span>FLEET READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid Section */}
      <section id="features" className="landing-features">
        <div className="section-header">
          <h3>System Capabilities</h3>
          <h2>Designed for High-Stress Operations</h2>
          <p>A mission-critical architecture built from the ground up for stability, visibility, and speed.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-red-alpha">🚨</div>
            <h4>Instant SOS Routing</h4>
            <p>One-tap citizen tracking signatures lock directly onto live browser satellite coordinates with auto-transmitting updates.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-blue-alpha">🗺️</div>
            <h4>Tactical Dispatch Math</h4>
            <p>Real-road OSRM engine calculations replace straight lines with dynamic routing telemetry, driving time vectors, and true ETA meters.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-green-alpha">🔒</div>
            <h4>Supabase Synchronization</h4>
            <p>Persistent account roles, structured log archives, and live database state connections run seamlessly without screen reloads.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon bg-orange-alpha">🏥</div>
            <h4>Critical Medical Profiling</h4>
            <p>Dispatch details display a victim's blood type, drug allergies, and high-risk medical intelligence records to field units immediately on arrival.</p>
          </div>
        </div>
      </section>

      {/* Process Flow Surface */}
      <section className="landing-workflow">
        <div className="section-header">
          <h3>Operational Loop</h3>
          <h2>How AGAP Seals the Latency Gap</h2>
        </div>

        <div className="workflow-steps">
          <div className="step-item">
            <div className="step-num">01</div>
            <h5>Trigger Signal</h5>
            <p>Citizen chooses dispatch context and activates emergency broadcast beacon.</p>
          </div>
          <div className="step-item">
            <div className="step-num">02</div>
            <h5>Evaluate Context</h5>
            <p>Command Center assesses incident metrics, coordinate variables, and matching dispatch data.</p>
          </div>
          <div className="step-item">
            <div className="step-num">03</div>
            <h5>Deploy Unit</h5>
            <p>Field teams receive automated pathways and navigate securely using active GPS nodes.</p>
          </div>
          <div className="step-item">
            <div className="step-num">04</div>
            <h5>Archive Event</h5>
            <p>Resolution details seal variables securely inside the immutable database server logs.</p>
          </div>
        </div>
      </section>

      {/* Footer Elements */}
      <footer className="landing-footer">
        <p>© 2026 AGAP Automated Platform System. Configured for Barangay Command Deployments.</p>
        <div className="footer-meta">
          <span>v1.2.0 Stable Build</span>
          <span className="status-indicator-green"><span className="pulse-dot-green"></span> Operational Layer Optimal</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;