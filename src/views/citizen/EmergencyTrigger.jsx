import React, { useState } from 'react';

const EmergencyTrigger = ({ onTrigger }) => {
  // --- Step 1: Category Selection ---
  // We start as null so the user is forced to make a selection
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // --- Step 2: Photo Upload ---
  const [isUploading, setIsUploading] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(null);

  const handleFakeUpload = () => {
    setIsUploading(true);
    // Simulate a 1.5-second network request
    setTimeout(() => {
      setAttachedPhoto('scene_evidence_001.jpg');
      setIsUploading(false);
    }, 1500);
  };

  // --- Step 3: Final Dispatch ---
  const handleDispatch = () => {
    if (!selectedCategory) {
      alert("Please select the type of emergency first.");
      return;
    }
    // Transmit to Command Center
    onTrigger(selectedCategory, attachedPhoto);
  };

  return (
    <div className="trigger-container slide-up" style={{ justifyContent: 'flex-start', paddingTop: '10px' }}>
      
      <div className="instruction-text" style={{ marginBottom: '24px', textAlign: 'left', width: '100%' }}>
        <h2 style={{ fontSize: '22px', color: 'var(--text-primary)' }}>Report Incident</h2>
        <p>Please provide details so we can dispatch the correct team to your GPS location.</p>
      </div>

      {/* --- STEP 1: CATEGORY SELECTION --- */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
          1. What is your emergency? <span style={{ color: 'var(--status-danger)' }}>*</span>
        </h3>
        
        {/* We use a 2x2 grid for larger, easier-to-tap buttons */}
        <div className="category-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '100%', margin: 0 }}>
          <div className={`category-btn ${selectedCategory === 'Medical' ? 'active' : ''}`} onClick={() => setSelectedCategory('Medical')} style={{ padding: '16px' }}>
            <span style={{ fontSize: '32px' }}>🚑</span>
            <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>Medical</p>
          </div>
          <div className={`category-btn ${selectedCategory === 'Fire' ? 'active' : ''}`} onClick={() => setSelectedCategory('Fire')} style={{ padding: '16px' }}>
            <span style={{ fontSize: '32px' }}>🔥</span>
            <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>Fire</p>
          </div>
          <div className={`category-btn ${selectedCategory === 'Crime' ? 'active' : ''}`} onClick={() => setSelectedCategory('Crime')} style={{ padding: '16px' }}>
            <span style={{ fontSize: '32px' }}>🚓</span>
            <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>Crime / Police</p>
          </div>
          <div className={`category-btn ${selectedCategory === 'Rescue / Other' ? 'active' : ''}`} onClick={() => setSelectedCategory('Rescue / Other')} style={{ padding: '16px' }}>
            <span style={{ fontSize: '32px' }}>⚠️</span>
            <p style={{ fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>Rescue / Other</p>
          </div>
        </div>
      </div>

      {/* --- STEP 2: PHOTO ATTACHMENT --- */}
      <div style={{ width: '100%', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
          2. Attach a Photo (Optional)
        </h3>
        
        {!attachedPhoto ? (
          <button 
            onClick={handleFakeUpload}
            disabled={isUploading}
            style={{ 
              width: '100%', padding: '16px', border: '2px dashed var(--border-color)', borderRadius: '12px', 
              background: isUploading ? 'var(--bg-hover)' : 'transparent', color: 'var(--text-secondary)', 
              cursor: isUploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              gap: '8px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
            }}
          >
            {isUploading ? (
              <span style={{ animation: 'blink 1s infinite' }}>⏳ Uploading to secure server...</span>
            ) : (
              <><span>📷</span> Tap to capture scene photo</>
            )}
          </button>
        ) : (
          <div style={{ 
            width: '100%', padding: '12px 16px', border: '1px solid var(--status-info)', borderRadius: '12px', 
            background: 'var(--status-info-bg)', color: '#1e3a8a', display: 'flex', alignItems: 'center', 
            justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🖼️</span> {attachedPhoto}
            </div>
            <span onClick={() => setAttachedPhoto(null)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: '16px' }} title="Remove photo">✖</span>
          </div>
        )}
      </div>

      {/* --- STEP 3: SUBMIT BUTTON --- */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
        <div className="sos-wrapper" style={{ width: '160px', height: '160px' }}>
          {/* Only show the glowing pulse ring if they have selected a category */}
          {selectedCategory && <div className="pulse-ring" style={{ width: '140px', height: '140px' }}></div>}
          
          <button 
            className="sos-button" 
            onClick={handleDispatch}
            disabled={!selectedCategory}
            style={{ 
              width: '140px', height: '140px', 
              background: selectedCategory ? 'var(--status-danger)' : 'var(--text-secondary)',
              opacity: selectedCategory ? 1 : 0.4,
              cursor: selectedCategory ? 'pointer' : 'not-allowed',
              boxShadow: selectedCategory ? '0 4px 12px rgba(239, 68, 68, 0.4)' : 'none',
              transform: selectedCategory ? '' : 'none' // stops the click animation if disabled
            }}
          >
            <span className="sos-text" style={{ fontSize: '32px' }}>SEND</span>
            <span className="sos-subtext" style={{ fontSize: '11px', marginTop: '4px' }}>ALERT</span>
          </button>
        </div>
        
        <div className="warning-text" style={{ marginTop: '24px', width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
          False alarms are punishable by barangay ordinance.
        </div>
      </div>

    </div>
  );
};

export default EmergencyTrigger;