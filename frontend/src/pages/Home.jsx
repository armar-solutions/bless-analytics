import React from 'react';
import SyncButton from '../components/SyncButton';

const Home = () => {
  return (
    <div style={{ fontFamily: "'Lora', serif" }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Dashboard</h1>
      <p>Welcome to the Influencer Analytics Dashboard.</p>
      <p>Select a category from the sidebar to view detailed reports.</p>
      
      {/* Admin Sync Button */}
      <SyncButton />
    </div>
  );
};

export default Home; 