import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const FUNNEL_TYPES = [
  { value: 'webinars', label: 'Вебінари' },
  { value: 'seminars', label: 'Семінари' },
  { value: 'courses', label: 'МНП' },
];

const dateRanges = [
  { value: '7d', label: '7 днів' },
  { value: '30d', label: '30 днів' },
  { value: '90d', label: '90 днів' },
  { value: 'all', label: 'Весь час' }
];

const FUNNEL_TYPE_MAP = {
  webinars: 'webinar',
  seminars: 'seminar',
  courses: 'course',
};

const FUNNEL_STAGE_MAP = {
  webinar: [
    { label: 'Реєстрація', stages: ['Нова реєстрація', 'Залишив заявку'] },
    { label: 'Кваліфікація', stages: ['Кваліфікований'] },
    { label: 'Вебінар переглянуто', stages: ['Подивився вебінар'] },
    { label: 'Втрачено', stages: ['Втрачено'] },
  ],
  seminar: [
    { label: 'Реєстрація', stages: ['Реєстрація на семінар', 'Записано'] },
    { label: 'Кваліфікація', stages: ['Кваліфікований', 'Не кваліфікований'] },
    { label: 'Передплата', stages: ['Предоплата проведена'] },
    { label: 'Оплата', stages: ['Сплачено'] },
    { label: 'Семінар пройдено', stages: ['Семінар пройдено'] },
    { label: 'Втрачено', stages: ['Втрачено'] },
  ],
  course: [
    { label: 'Записано', stages: ['Записано', 'Нова заявка'] },
    { label: 'Презентація', stages: ['Презентація проведена'] },
    { label: 'Передплата', stages: ['Передплата отримана'] },
    { label: 'Оплата', stages: ['Оплачено'] },
    { label: 'Курс пройдено', stages: ['Курс пройдено'] },
    { label: 'Втрачено', stages: ['Втрачено'] },
  ],
};

const COLORS = [
  '#7c5b1a', '#a97c2f', '#c9a13a', '#e6c24a', '#f7e06b', '#f9f6b2', '#f9f6e7'
];
const FADED_COLOR = '#e5e7eb';

const useFunnelData = (type, dateRange, startDate, endDate) => {
  const [funnelData, setFunnelData] = useState({ funnel: [], lost: 0, converted: 0, totalLeads: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (dateRange) params.append('dateRange', dateRange);
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    fetch(`/api/funnels/${type}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async res => {
        let data;
        try {
          data = await res.json();
        } catch {
          setError('Помилка завантаження (невірний формат даних)');
          setFunnelData({ funnel: [], lost: 0, converted: 0, totalLeads: 0 });
          setLoading(false);
          return;
        }
        if (res.ok && data && typeof data === 'object' && Array.isArray(data.funnel)) {
          setFunnelData({ ...data, totalLeads: data.totalLeads || 0 });
        } else {
          setError(data?.error || 'Помилка завантаження');
          setFunnelData({ funnel: [], lost: 0, converted: 0, totalLeads: 0 });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Помилка завантаження');
        setFunnelData({ funnel: [], lost: 0, converted: 0, totalLeads: 0 });
        setLoading(false);
      });
  }, [type, dateRange, startDate, endDate, token]);
  return { ...funnelData, loading, error };
};

const FunnelSection = ({ type, label, dateRange, startDate, endDate, style }) => {
  const { funnel, lost, converted, totalLeads, loading, error } = useFunnelData(type, dateRange, startDate, endDate);
  // Use backend output directly
  const stepCounts = funnel ? funnel.map(step => ({ label: step.label, count: step.count, dropped: step.dropped })) : [];
  const maxCount = stepCounts.length > 0 ? stepCounts[0].count : 0;
  return (
    <section style={{ background: '#fafbfc', borderRadius: 18, padding: '2rem', margin: '0 auto 28px auto', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', width: 600, minWidth: 600, maxWidth: 600, display: 'flex', flexDirection: 'column', ...style }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>{label}</h2>
      {/* Diagram for conversion and lost, with total leads */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: 22 }}>{totalLeads}</div>
          <div style={{ color: '#1d4ed8', fontWeight: 600, fontSize: 16 }}>Всього лідів</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 22 }}>{converted}</div>
          <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 16 }}>Конверсія</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 22 }}>{lost}</div>
          <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 16 }}>Втрачено</div>
        </div>
      </div>
      {loading && <div style={{ color: '#888', textAlign: 'center' }}>Завантаження...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      <div style={{ marginTop: 18 }}>
        {Array.isArray(stepCounts) && stepCounts.length > 0 ? (
          stepCounts.map((step, idx) => {
            const color = COLORS[idx % COLORS.length];
            const barWidth = maxCount ? (step.count / maxCount) * 100 : 0;
            const lost = step.dropped;
            const lostPercent = step.count && lost ? Math.round((lost / step.count) * 100) : 0;
            return (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 18, minWidth: 0 }}>
                <div style={{ minWidth: 180, fontSize: 17, fontWeight: 600, color: '#5a4a1a', whiteSpace: 'nowrap', marginRight: 18, textAlign: 'right' }}>{step.label}</div>
                <div style={{ position: 'relative', width: '100%', maxWidth: 500, height: 38, display: 'flex', alignItems: 'center', minWidth: 0, marginRight: 24, borderRadius: 22, overflow: 'hidden', justifyContent: 'center' }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: 38,
                    background: color,
                    borderRadius: 22,
                    transition: 'width 0.3s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    zIndex: 2,
                    position: 'relative',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {barWidth > 40 ? (
                      <span style={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 18,
                        textShadow: '0 1px 4px rgba(0,0,0,0.12)'
                      }}>
                        {step.count} — {Math.round((step.count / maxCount) * 100)}%
                      </span>
                    ) : null}
                  </div>
                  {barWidth <= 40 && (
                    <span style={{
                      color: '#5a4a1a',
                      position: 'absolute',
                      left: 'calc(50% + ' + (barWidth / 2) + '% + 8px)',
                      fontWeight: 700,
                      fontSize: 18,
                      whiteSpace: 'nowrap',
                      zIndex: 4
                    }}>
                      {step.count} — {Math.round((step.count / maxCount) * 100)}%
                    </span>
                  )}
                </div>
                <div style={{
                  marginLeft: 16,
                  minWidth: 48,
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: 16,
                  textAlign: 'right',
                  visibility: lost > 0 ? 'visible' : 'hidden'
                }}>
                  {lost > 0 ? `${lost} ` : ''}<span style={{ fontSize: 14 }}>{lost > 0 ? `(${lostPercent}%)` : ''}</span>
                </div>
              </div>
            );
          })
        ) : (
          !loading && !error && <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>Немає даних для цієї воронки</div>
        )}
      </div>
    </section>
  );
};

const Funnels = () => {
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <div style={{ padding: '2rem', width: '100%' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            value={dateRange} 
            onChange={e => setDateRange(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '0.875rem' }}
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            placeholder="Початок"
          />
          <span>-</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
            placeholder="Кінець"
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28, justifyContent: 'center', width: '100%' }}>
        {FUNNEL_TYPES.length === 3 ? (
          <>
            <FunnelSection key={FUNNEL_TYPES[0].value} type={FUNNEL_TYPES[0].value} label={FUNNEL_TYPES[0].label} dateRange={dateRange} startDate={startDate} endDate={endDate} />
            <FunnelSection key={FUNNEL_TYPES[1].value} type={FUNNEL_TYPES[1].value} label={FUNNEL_TYPES[1].label} dateRange={dateRange} startDate={startDate} endDate={endDate} />
            <FunnelSection key={FUNNEL_TYPES[2].value} type={FUNNEL_TYPES[2].value} label={FUNNEL_TYPES[2].label} dateRange={dateRange} startDate={startDate} endDate={endDate} style={{ gridColumn: '1 / span 2', justifySelf: 'center' }} />
          </>
        ) : (
          FUNNEL_TYPES.map(opt => (
            <FunnelSection key={opt.value} type={opt.value} label={opt.label} dateRange={dateRange} startDate={startDate} endDate={endDate} />
          ))
        )}
      </div>
    </div>
  );
};

export default Funnels; 