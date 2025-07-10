import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LabelList } from 'recharts';
import { FiSearch, FiFilter, FiTrendingUp, FiUsers, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const LearningCenter = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const { token } = useAuth();

  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const productTypes = [
    { value: 'all', label: 'Всі продукти' },
    { value: 'courses', label: 'Курси' },
    { value: 'seminars', label: 'Семінари' },
    { value: 'webinars', label: 'Вебінари' }
  ];

  const dateRanges = [
    { value: '7d', label: '7 днів' },
    { value: '30d', label: '30 днів' },
    { value: '90d', label: '90 днів' },
    { value: 'all', label: 'Весь час' }
  ];

  // Fetch overview stats
  const fetchOverview = async () => {
    try {
      const params = new URLSearchParams({
        type: selectedType,
        dateRange: dateRange
      });
      const response = await fetch(`/api/learning/overview?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOverview(data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  // Fetch trends
  const fetchTrends = async () => {
    try {
      const params = new URLSearchParams({
        type: selectedType,
        dateRange: dateRange
      });
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      
      const response = await fetch(`/api/learning/trends?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTrends(data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  // Fetch all data when filters change
  useEffect(() => {
    fetchOverview();
    fetchTrends();
  }, [selectedType, dateRange, token]);

  const styles = {
    container: { padding: '2rem' },
    header: { 
      fontFamily: "'Lora', serif", 
      fontSize: '2.25rem', 
      fontWeight: 'bold', 
      marginBottom: '2rem',
      color: '#1f2937'
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    select: {
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '0.875rem'
    },
    input: {
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '0.875rem'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      flex: '1',
      maxWidth: '300px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.25rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    chartContainer: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '2rem'
    },
    chartTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#1f2937'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tableHeaderCell: {
      padding: '1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.875rem'
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '0.875rem'
    },
    typeBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    typeBadgeCourses: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    typeBadgeSeminars: {
      backgroundColor: '#fef3c7',
      color: '#d97706'
    },
    typeBadgeWebinars: {
      backgroundColor: '#e0e7ff',
      color: '#7c3aed'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Центр навчання</h1>
      
      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <FiFilter size={16} />
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.select}
          >
            {productTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.select}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.input}
            placeholder="Початок"
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.input}
            placeholder="Кінець"
          />
        </div>
        
        <div style={styles.searchBox}>
          <FiSearch size={16} color="#6b7280" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Пошук продуктів..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div style={styles.statsGrid}>
          {/* Overall Summary */}
          <div style={{...styles.statCard, borderTop: '4px solid #059669'}}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#059669' }}>
              Загальна статистика
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.totals?.total_signed_up || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiUsers size={16} />
                  Всього підписалися
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.totals?.total_paid || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiDollarSign size={16} />
                  Всього оплачено
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.totals?.conversion || 0}%
                </div>
                <div style={styles.statLabel}>
                  <FiTrendingUp size={16} />
                  Загальна конверсія
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.totals?.total_completed || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiCheckCircle size={16} />
                  Всього завершено
                </div>
              </div>
            </div>
          </div>

          {/* Webinars Summary */}
          <div style={{...styles.statCard, borderTop: '4px solid #7c3aed'}}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#7c3aed' }}>
              Вебінари
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.webinars?.total_signed_up || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiUsers size={16} />
                  Підписалися
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.webinars?.total_paid || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiDollarSign size={16} />
                  Оплачено
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {typeof overview.stats?.webinars?.conversion === 'number'
                    ? overview.stats.webinars.conversion
                    : (overview.stats?.webinars?.total_paid && overview.stats?.webinars?.total_interested
                        ? Math.round((overview.stats.webinars.total_paid / (overview.stats.webinars.total_paid + overview.stats.webinars.total_interested)) * 100)
                        : 0)
                  }%
                </div>
                <div style={styles.statLabel}>
                  <FiTrendingUp size={16} />
                  Конверсія
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.webinars?.total_completed || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiCheckCircle size={16} />
                  Завершено
                </div>
              </div>
            </div>
          </div>

          {/* Seminars Summary */}
          <div style={{...styles.statCard, borderTop: '4px solid #d97706'}}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#d97706' }}>
              Семінари
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.seminars?.total_signed_up || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiUsers size={16} />
                  Підписалися
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.seminars?.total_paid || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiDollarSign size={16} />
                  Оплачено
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {typeof overview.stats?.seminars?.conversion === 'number'
                    ? overview.stats.seminars.conversion
                    : (overview.stats?.seminars?.total_paid && overview.stats?.seminars?.total_interested
                        ? Math.round((overview.stats.seminars.total_paid / (overview.stats.seminars.total_paid + overview.stats.seminars.total_interested)) * 100)
                        : 0)
                  }%
                </div>
                <div style={styles.statLabel}>
                  <FiTrendingUp size={16} />
                  Конверсія
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.seminars?.total_completed || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiCheckCircle size={16} />
                  Завершено
                </div>
              </div>
            </div>
          </div>

          {/* МНП Courses Summary */}
          <div style={{...styles.statCard, borderTop: '4px solid #1e40af'}}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e40af' }}>
              МНП Курси
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.courses?.total_signed_up || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiUsers size={16} />
                  Підписалися
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.courses?.total_paid || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiDollarSign size={16} />
                  Оплачено
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {typeof overview.stats?.courses?.conversion === 'number'
                    ? overview.stats.courses.conversion
                    : (overview.stats?.courses?.total_paid && overview.stats?.courses?.total_interested
                        ? Math.round((overview.stats.courses.total_paid / (overview.stats.courses.total_paid + overview.stats.courses.total_interested)) * 100)
                        : 0)
                  }%
                </div>
                <div style={styles.statLabel}>
                  <FiTrendingUp size={16} />
                  Конверсія
                </div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {overview.stats?.courses?.total_completed || 0}
                </div>
                <div style={styles.statLabel}>
                  <FiCheckCircle size={16} />
                  Завершено
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Chart */}
      {trends.length > 0 && (
        <div style={styles.chartContainer}>
          <h2 style={styles.chartTitle}>Динаміка показників</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enrolled" stroke="#8884d8" name="Записані" strokeWidth={2} />
              <Line type="monotone" dataKey="paid" stroke="#82ca9d" name="Оплачено" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#ffc658" name="Завершено" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Products Charts */}
      {/* Product Category Table hidden as requested */}
    </div>
  );
};

export default LearningCenter; 