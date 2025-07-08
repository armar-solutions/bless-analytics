// Helper to clean up email strings and extract name
const cleanEmail = (email) => {
  if (!email) return '';
  return email
    .replace(/^[{["']+/, '')   // Remove leading {, [, ", '
    .replace(/[}\]"']+$/, '')   // Remove trailing }, ], ", '
    .split(',')[0]                // If it's a list, take the first email
    .trim();
};
const getManagerNameFromEmail = (email) => {
  const clean = cleanEmail(email);
  if (!clean) return '';
  const local = clean.split('@')[0];
  const parts = local.split(/[._]/).filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
};

import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as MiniLineChart, Line as MiniLine, ResponsiveContainer as MiniResponsiveContainer } from 'recharts';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFE', '#FF6699'];

const SORT_OPTIONS = [
  { value: 'revenue', label: 'За виручкою' },
  { value: 'deals', label: 'За кількістю завершених' }
];

const Managers = () => {
  const [summary, setSummary] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('http://localhost:3001/api/managers/summary').then(res => res.json()),
      fetch('http://localhost:3001/api/managers/trends').then(res => res.json())
    ]).then(([summaryData, trendsData]) => {
      setSummary(summaryData);
      setTrends(trendsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Sort managers by selected metric
  const sortedSummary = useMemo(() => {
    if (sortBy === 'deals') {
      return [...summary].sort((a, b) => (Number(b.completed_deals) || 0) - (Number(a.completed_deals) || 0));
    }
    // Default: revenue
    return [...summary].sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0));
  }, [summary, sortBy]);

  // KPI cards
  const totalDeals = useMemo(() => summary.reduce((sum, m) => sum + Number(m.total_deals || 0), 0), [summary]);
  const totalRevenue = useMemo(() => summary.reduce((sum, m) => sum + Number(m.revenue || 0), 0), [summary]);
  const topManagerName = useMemo(() => getManagerNameFromEmail(sortedSummary[0]?.manager), [sortedSummary]);

  // Prepare trends data for recharts (group by month, one line per manager)
  const chartData = useMemo(() => {
    const byMonth = {};
    trends.forEach(row => {
      const month = row.month ? row.month.slice(0, 7) : 'Unknown';
      const managerName = getManagerNameFromEmail(row.manager);
      if (!byMonth[month]) byMonth[month] = { month };
      byMonth[month][managerName] = Number(row.total_deals || 0);
    });
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
  }, [trends]);

  const managerList = useMemo(() => sortedSummary.map(m => getManagerNameFromEmail(m.manager)), [sortedSummary]);

  // Prepare per-manager revenue trends for sparklines
  const managerRevenueTrends = useMemo(() => {
    const trendsByManager = {};
    trends.forEach(row => {
      const managerName = getManagerNameFromEmail(row.manager);
      const month = row.month ? row.month.slice(0, 7) : 'Unknown';
      if (!trendsByManager[managerName]) trendsByManager[managerName] = [];
      trendsByManager[managerName].push({ month, revenue: Number(row.revenue || 0) });
    });
    // Sort months for each manager
    Object.values(trendsByManager).forEach(arr => arr.sort((a, b) => a.month.localeCompare(b.month)));
    return trendsByManager;
  }, [trends]);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', minWidth: 200 }}>
          <div style={{ fontSize: 14, color: '#888' }}>Всього угод</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{totalDeals}</div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', minWidth: 200 }}>
          <div style={{ fontSize: 14, color: '#888' }}>Всього виручка</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{totalRevenue ? `₴${totalRevenue.toLocaleString('uk-UA', { maximumFractionDigits: 0 })}` : 'N/A'}</div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', minWidth: 200 }}>
          <div style={{ fontSize: 14, color: '#888' }}>Топ-менеджер</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{topManagerName}</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}>
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Динаміка угод по менеджерах</div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {managerList.map((manager, idx) => (
              <Line key={manager} type="monotone" dataKey={manager} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 2 }} name={manager} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {sortedSummary.map((m) => {
          // Calculate average deal price for completed deals
          const avgDealPrice = m.completed_deals > 0 ? Math.round((m.revenue || 0) / m.completed_deals) : 0;
          const leadsInProgress = (m.total_deals || 0) - (m.completed_deals || 0) - (m.lost_deals || 0);
          return (
            <div key={m.manager} style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', padding: '1.5rem', minWidth: 220, flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Manager name and email */}
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, alignSelf: 'flex-start' }}>{getManagerNameFromEmail(m.manager)}</div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 8, alignSelf: 'flex-start' }}>{cleanEmail(m.manager)}</div>
              {/* Revenue and average deal price in same row */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, width: '100%' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#888' }}>Виручка</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{m.revenue ? `₴${Number(m.revenue).toLocaleString('uk-UA', { maximumFractionDigits: 0 })}` : 'N/A'}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#888' }}>Середній чек</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{avgDealPrice ? `₴${avgDealPrice.toLocaleString('uk-UA', { maximumFractionDigits: 0 })}` : 'N/A'}</div>
                </div>
              </div>
              {/* Mini revenue trend chart moved up */}
              <div style={{ width: '100%', height: 40, marginBottom: 12 }}>
                <MiniResponsiveContainer width="100%" height="100%">
                  <MiniLineChart data={managerRevenueTrends[getManagerNameFromEmail(m.manager)] || []}>
                    <MiniLine type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} dot={false} />
                  </MiniLineChart>
                </MiniResponsiveContainer>
              </div>
              {/* Separator bar */}
              <div style={{ width: '100%', height: 1, backgroundColor: '#e5e7eb', marginBottom: 12 }}></div>
              {/* Leads breakdown row under separator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>Завершено</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{m.completed_deals}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>У процесі</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{leadsInProgress}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>Втрачено</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{m.lost_deals}</div>
                </div>
              </div>
              {/* Progress bar style for completed, in progress, and lost */}
              <div style={{ width: '100%', marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Статус угод</div>
                <div style={{ 
                  width: '100%', 
                  height: 12, 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: 6, 
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex'
                }}>
                  <div style={{ 
                    width: `${m.total_deals > 0 ? (m.completed_deals / m.total_deals) * 100 : 0}%`, 
                    backgroundColor: '#22c55e', 
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }}></div>
                  <div style={{ 
                    width: `${m.total_deals > 0 ? (leadsInProgress / m.total_deals) * 100 : 0}%`, 
                    backgroundColor: '#2563eb', 
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }}></div>
                  <div style={{ 
                    width: `${m.total_deals > 0 ? (m.lost_deals / m.total_deals) * 100 : 0}%`, 
                    backgroundColor: '#ef4444', 
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#666', marginTop: 2 }}>
                  {m.total_deals > 0 ? Math.round((m.completed_deals / m.total_deals) * 100) : 0}% завершено
                </div>
                {/* Legend for progress bar */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: '#22c55e' }}>
                    <span style={{ width: 12, height: 6, background: '#22c55e', display: 'inline-block', borderRadius: 2, marginRight: 4 }}></span>Завершено
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: '#2563eb' }}>
                    <span style={{ width: 12, height: 6, background: '#2563eb', display: 'inline-block', borderRadius: 2, marginRight: 4 }}></span>У процесі
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: '#ef4444' }}>
                    <span style={{ width: 12, height: 6, background: '#ef4444', display: 'inline-block', borderRadius: 2, marginRight: 4 }}></span>Втрачено
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {loading && <div style={{ textAlign: 'center', color: '#888' }}>Завантаження...</div>}
    </div>
  );
};

export default Managers; 