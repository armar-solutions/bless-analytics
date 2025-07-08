import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Products = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all unique sub-courses for МНП
  useEffect(() => {
    fetch('http://localhost:3001/api/mnp-courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]);
      });
  }, []);

  // Fetch stats when course or date changes
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (selectedCourse) params.append('courseName', selectedCourse);
    fetch(`http://localhost:3001/api/mnp-stats?${params.toString()}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setError('Помилка завантаження статистики'))
      .finally(() => setLoading(false));
  }, [selectedCourse, start, end]);

  return (
    <div>
      <h1 style={{ fontFamily: "'Lora', serif", fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Продукти
      </h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: 24 }}>
        <label>
          Курс:
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 6 }}>
            {courses.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          З:
          <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 6 }} />
        </label>
        <label>
          По:
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 6 }} />
        </label>
      </div>
      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && stats.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px #eee', marginBottom: 32 }}>
          <h2 style={{ textAlign: 'center', fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 24, marginBottom: 16 }}>
            Статистика {selectedCourse}
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrolled" stroke="#8884d8" name="Записані клієнти" strokeWidth={2} />
              <Line type="monotone" dataKey="paid" stroke="#82ca9d" name="Оплачено навчання" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#ffc658" name="Завершили навчання" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Products; 