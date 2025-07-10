import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';
import { FiSearch, FiUser, FiMail, FiPhone, FiAward, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

// --- Reusable Components ---

const StatCard = ({ title, data, colors }) => (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>{title}</h3>
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    <div style={styles.legend}>
      {data.map((entry, index) => (
        <div key={entry.name} style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: colors[index % colors.length] }}></span>
          {entry.name} ({entry.value})
        </div>
      ))}
    </div>
  </div>
);

const StudentProfileModal = ({ student, onClose }) => {
  if (!student) return null;
  // Helper to clean up email/phone
  const cleanEmail = (email) => {
    if (!email) return '';
    return email
      .replace(/^[{["']+/, '')   // Remove leading {, [, ", '
      .replace(/[}\]"']+$/, '')   // Remove trailing }, ], ", '
      .split(',')[0]                // If it's a list, take the first email
      .trim();
  };
  return (
    <div style={styles.modalBackdrop}>
      <div style={styles.modalContent}>
        <button onClick={onClose} style={styles.modalCloseButton}><FiX /></button>
        <h2 style={styles.modalTitle}>{student.name}</h2>
        <div style={styles.modalContact}>
          <span><FiMail /> {cleanEmail(student.email) || 'N/A'}</span>
          <span><FiPhone /> {cleanEmail(student.phone_number) || 'N/A'}</span>
        </div>
        <h3 style={styles.modalSectionTitle}>Історія активності</h3>
        <div style={styles.modalTimeline}>
          {student.deals && student.deals.map((deal, index) => (
            <div key={index} style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <span style={styles.timelineDate}>{new Date(deal.created_at).toLocaleDateString()}</span>
                <p><strong>{deal.name}</strong> ({deal.type})</p>
                <p>Статус: <span style={styles.statusBadge}>{deal.stage}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Students Page Component ---

const Students = () => {
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState([]);
  const { token } = useAuth();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');

  // Pagination for student list
  const [visibleCount, setVisibleCount] = useState(10);

  const segmentMap = {
    all: 'Всі студенти',
    new_student: 'Нові студенти',
    repeat_student: 'Повторні студенти',
    power_user: 'Постійні клієнти',
  };

  // Helper to clean up email strings
  const cleanEmail = (email) => {
    if (!email) return '';
    return email
      .replace(/^[{["']+/, '')   // Remove leading {, [, ", '
      .replace(/[}\]"']+$/, '')   // Remove trailing }, ], ", '
      .split(',')[0]                // If it's a list, take the first email
      .trim();
  };

  // Fetch all necessary data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      const params = new URLSearchParams();
      if (segmentFilter !== 'all') params.append('segment', segmentFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      try {
        const response = await fetch(`/api/students?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [searchTerm, segmentFilter, token]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/students/leaderboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLeaderboard(await response.json());
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, [token]);

  useEffect(() => {
    fetch('/api/engagement-over-time', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setEngagementData)
      .catch(() => setEngagementData([]));
  }, [token]);

  const handleSelectStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedStudent(await response.json());
    } catch (error) {
      console.error("Failed to fetch student details:", error);
    }
  };

  // Memoized analytics data derived from the students list
  const analyticsData = useMemo(() => {
    const completionData = [
      { name: '0 курсів', value: students.filter(s => s.total_completions === 0).length },
      { name: '1 курс', value: students.filter(s => s.total_completions === 1).length },
      { name: '2+ курса', value: students.filter(s => s.total_completions >= 2).length },
    ];
    
    const segmentData = [
      { name: 'Нові', value: students.filter(s => s.segment === 'new_student').length },
      { name: 'Повторні', value: students.filter(s => s.segment === 'repeat_student').length },
      { name: 'Постійні', value: students.filter(s => s.segment === 'power_user').length },
    ];

    return { completionData, segmentData };
  }, [students]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div style={styles.container}>
      {/* Analytics Cards */}
      <div style={styles.statsGrid}>
        <StatCard title="Рівень завершення" data={analyticsData.completionData} colors={COLORS} />
        <StatCard title="Сегменти учнів" data={analyticsData.segmentData} colors={COLORS} />
        {/* Engagement Over Time Chart */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Активні учні по місяцях</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={engagementData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} label={{ value: 'Активні Студенти', angle: -90, position: 'insideLeft', fontSize: 14 }} />
              <Tooltip formatter={value => [value, 'Активні Студенти']} />
              <Line type="monotone" dataKey="active_students" stroke="#0088FE" strokeWidth={2} dot={{ r: 3 }} name="Активні Студенти" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Main Content: Student List & Leaderboard */}
      <div style={styles.mainContent}>
        {/* Left Side: Student List */}
        <div style={styles.studentListContainer}>
          <h2 style={styles.sectionTitle}>Список студентів</h2>
          {/* Filters */}
          <div style={styles.filters}>
            <div style={styles.searchBox}>
              <FiSearch color="#999" />
              <input 
                type="text" 
                placeholder="Пошук за іменем або email..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select style={styles.filterSelect} value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)}>
              {Object.entries(segmentMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          {/* Student Table */}
          <div style={styles.tableWrapper}>
            {loading ? <p>Завантаження...</p> : (
              <>
              <table style={{...styles.table, minWidth: 400, maxWidth: 440}}>
                <thead>
                  <tr>
                    <th style={styles.th}>Ім'я</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Записано</th>
                    <th style={styles.th}>Завершено</th>
                    <th style={styles.th}>Сегмент</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, visibleCount).map(student => (
                    <tr key={student.record_id} onClick={() => handleSelectStudent(student.record_id)} style={styles.tr}>
                      <td style={styles.td}>{student.name}</td>
                      <td style={styles.td}>{cleanEmail(student.email)}</td>
                      <td style={styles.td}>{student.total_enrollments}</td>
                      <td style={styles.td}>{student.total_completions}</td>
                      <td style={styles.td}>{segmentMap[student.segment]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length > visibleCount && (
                <button style={{marginTop: 12, padding: '0.5rem 1.5rem', borderRadius: 8, border: '1px solid #ccc', background: '#f7f7f7', cursor: 'pointer'}} onClick={() => setVisibleCount(visibleCount + 10)}>
                  Показати ще
                </button>
              )}
              </>
            )}
          </div>
        </div>
        
        {/* Right Side: Leaderboard */}
        <div style={styles.leaderboardContainer}>
            <h2 style={styles.sectionTitle}>Топ-10 студентів</h2>
            <ol style={styles.leaderboardList}>
                {leaderboard.map((student, index) => (
                    <li key={index} style={styles.leaderboardItem}>
                        <span style={styles.leaderboardRank}>{index + 1}</span>
                        <div style={styles.leaderboardInfo}>
                            <p style={{margin:0, fontWeight: 600}}>{student.name}</p>
                            <p style={{margin:0, color: '#666', fontSize: 12}}>{cleanEmail(student.email)}</p>
                        </div>
                        <span style={styles.leaderboardScore}><FiAward size={14} /> {student.purchase_count}</span>
                    </li>
                ))}
            </ol>
        </div>
      </div>
      
      {/* Student Profile Modal */}
      <StudentProfileModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  );
};

// --- Styles ---
const styles = {
  container: { padding: '2rem' },
  header: { fontFamily: "'Lora', serif", fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 600 },
  legend: { display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%' },
  mainContent: { display: 'flex', gap: '2rem', justifyContent: 'center' },
  studentListContainer: { flex: '0 0 62%', maxWidth: '62%', minWidth: 320, backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  leaderboardContainer: { flex: '0 0 36%', maxWidth: '36%', minWidth: 320, backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 600 },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.5rem', flexGrow: 1 },
  searchInput: { border: 'none', outline: 'none', width: '100%' },
  filterSelect: { padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #ccc' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', },
  th: { borderBottom: '2px solid #eee', padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#555' },
  td: { borderBottom: '1px solid #eee', padding: '0.75rem' },
  tr: { cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } },
  leaderboardList: { listStyle: 'none', padding: 0, margin: 0 },
  leaderboardItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #eee' },
  leaderboardRank: { fontSize: '1rem', fontWeight: 'bold', color: '#999', width: '20px' },
  leaderboardInfo: { flexGrow: 1 },
  leaderboardScore: { fontWeight: 'bold', color: '#0088FE', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '90%', maxWidth: '600px', position: 'relative' },
  modalCloseButton: { position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' },
  modalTitle: { margin: '0 0 0.5rem 0' },
  modalContact: { display: 'flex', gap: '1.5rem', color: '#555', marginBottom: '1.5rem' },
  modalSectionTitle: { margin: '0 0 1rem 0', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' },
  modalTimeline: { maxHeight: '300px', overflowY: 'auto' },
  timelineItem: { display: 'flex', gap: '1rem', position: 'relative', paddingLeft: '1.5rem', paddingBottom: '1rem' },
  timelineDot: { position: 'absolute', left: 0, top: '5px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0088FE' },
  timelineContent: { borderLeft: '2px solid #eee', paddingLeft: '1.5rem', marginLeft: '-1.1rem' },
  timelineDate: { fontSize: '0.8rem', color: '#999', marginBottom: '0.25rem' },
  statusBadge: { backgroundColor: '#eee', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }
};

export default Students; 