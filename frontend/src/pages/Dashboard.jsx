import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [message, setMessage] = useState('Loading...');
  const { token } = useAuth();

  useEffect(() => {
    fetch('/api/test', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error(err);
        setMessage('Failed to fetch data from backend.');
      });
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Products Dashboard</h1>
      <p className="mt-4" style={{marginTop: '1rem'}}>
        Backend says: <span style={{fontWeight: 'bold', color: '#16a34a'}}>{message}</span>
      </p>
    </div>
  );
};

export default Dashboard; 