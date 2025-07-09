const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { runSyncWithResults } = require('../sync');
const { authenticateToken, requireAdmin, requireManager } = require('../middleware/auth');

// Utility function to get the oldest record date across all analytics tables
const getOldestRecordDate = async () => {
  try {
    const result = await pool.query(`
      SELECT MIN(oldest_date) as oldest_date FROM (
        SELECT MIN(created_at) as oldest_date FROM course_deals
        UNION ALL
        SELECT MIN(created_at) as oldest_date FROM seminars
        UNION ALL
        SELECT MIN(created_at) as oldest_date FROM webinars
      ) as all_dates
      WHERE oldest_date IS NOT NULL
    `);
    
    return result.rows[0]?.oldest_date || new Date('2020-01-01'); // fallback date
  } catch (error) {
    console.error('Error getting oldest record date:', error);
    return new Date('2020-01-01'); // fallback date
  }
};

// GET /api/contacts
router.get('/contacts', authenticateToken, requireManager, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/seminars
router.get('/seminars', authenticateToken, requireManager, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seminars ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seminars:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/course-deals
router.get('/course-deals', authenticateToken, requireManager, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM course_deals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching course deals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/mnp-stats
// Query params: start, end, courseName
router.get('/mnp-stats', authenticateToken, requireManager, async (req, res) => {
  const { start, end, courseName } = req.query;
  const paidStatuses = [
    'Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена',
    'Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар',
    'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар'
  ];
  const enrolledStatuses = [
    'Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар',
    'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар'
  ];
  const completedStatuses = [
    'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар', 'Кваліфікований'
  ];

  let where = [];
  let params = [];
  let idx = 1;
  if (start) {
    where.push(`created_at >= $${idx++}`);
    params.push(start);
  }
  if (end) {
    where.push(`created_at <= $${idx++}`);
    params.push(end);
  }
  if (courseName) {
    where.push(`lower(trim(name)) = $${idx++}`);
    params.push(courseName);
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT
      to_char(created_at, 'YYYY-MM-DD') as day,
      COUNT(*) FILTER (WHERE stage = ANY($${idx}::text[])) as enrolled,
      COUNT(*) FILTER (WHERE stage = ANY($${idx + 1}::text[])) as paid,
      COUNT(*) FILTER (WHERE stage = ANY($${idx + 2}::text[])) as completed
    FROM course_deals
    ${whereClause}
    GROUP BY day
    ORDER BY day
  `;
  params.push(enrolledStatuses, paidStatuses, completedStatuses);

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching MNP stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/mnp-courses
router.get('/mnp-courses', authenticateToken, requireManager, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT lower(trim(name)) AS normalized_name
      FROM course_deals
      WHERE name IS NOT NULL AND trim(name) <> ''
      ORDER BY normalized_name
    `);
    res.json(result.rows.map(row => row.normalized_name));
  } catch (error) {
    console.error('Error fetching MNP course names:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define status groups for consistent funnel logic across all learning endpoints.
// Logic: A user must pay before enrolling, and enroll before completing.
// Paid -> Enrolled -> Completed
const paidStatuses = [
  'Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена'
];

// Webinar-specific paid statuses (users pay to get qualified)
const webinarPaidStatuses = [
  'Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена', 'Кваліфікований'
];

const completedStatuses = [
  'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар', 'Кваліфікований'
];
const enrolledStatuses = [
  'Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар',
  'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар'
];
const allStages = [
  'Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар',
  'Презентація проведена', 'Кваліфікований', 'Не кваліфікований',
  ...paidStatuses, ...completedStatuses
];
// Interested = not in paid or completed
const interestedStages = allStages.filter(s => !paidStatuses.includes(s) && !completedStatuses.includes(s) && s !== 'Втрачено');

// Webinar-specific interested stages (exclude qualified as it's now paid)
const webinarInterestedStages = allStages.filter(s => !webinarPaidStatuses.includes(s) && !completedStatuses.includes(s) && s !== 'Втрачено');

// Stages for 'signed up' (past registration)
const signedUpStages = {
  webinars: ['Кваліфікований', 'Подивився вебінар'],
  seminars: ['Кваліфікований', 'Не кваліфікований', 'Передплата', 'Оплата', 'Семінар пройдено'],
  courses: ['Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар', 'Презентація проведена', 'Кваліфікований', 'Не кваліфікований', 'Передплата отримана', 'Оплачено', 'Сплачено', 'Предоплата проведена', 'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар']
};

// Paid statuses for courses (МНП)
const coursePaidStatuses = ['Передплата отримана', 'Оплачено', 'Сплачено', 'Предоплата проведена', 'Кваліфікований'];

// GET /api/learning/overview
// Query params: type (all, courses, seminars, webinars), dateRange (7d, 30d, 90d, all)
router.get('/learning/overview', authenticateToken, requireManager, async (req, res) => {
  const { type = 'all', dateRange = '30d' } = req.query;
  
  try {
    let stats = {};
    
    // Get the oldest record date if using 'all' time range
    let oldestDate = null;
    if (dateRange === 'all') {
      oldestDate = await getOldestRecordDate();
    }
    
    const query = (table) => {
      let whereClause = '';
      if (dateRange === 'all' && oldestDate) {
        whereClause = `WHERE created_at >= $4`;
      } else if (dateRange !== 'all') {
        whereClause = `WHERE created_at >= NOW() - INTERVAL '${dateRange}'`;
      }
      // For courses, paid = paid OR completed
      if (table === 'course_deals') {
        return `
          SELECT 
            COUNT(*) FILTER (WHERE stage = ANY($1)) as total_interested,
            COUNT(*) FILTER (WHERE stage = ANY($2) OR stage = ANY($3)) as total_paid,
            COUNT(*) FILTER (WHERE stage = ANY($3)) as total_completed
          FROM ${table}
          ${whereClause}
        `;
      }
      // Default for other tables
      return `
        SELECT 
          COUNT(*) FILTER (WHERE stage = ANY($1)) as total_interested,
          COUNT(*) FILTER (WHERE stage = ANY($2)) as total_paid,
          COUNT(*) FILTER (WHERE stage = ANY($3)) as total_completed
        FROM ${table}
        ${whereClause}
      `;
    };

    const webinarQuery = (table) => {
      let whereClause = '';
      if (dateRange === 'all' && oldestDate) {
        whereClause = `WHERE created_at >= $4`;
      } else if (dateRange !== 'all') {
        whereClause = `WHERE created_at >= NOW() - INTERVAL '${dateRange}'`;
      }
      
      return `
        SELECT 
          COUNT(*) FILTER (WHERE stage = ANY($1)) as total_interested,
          COUNT(*) FILTER (WHERE stage = ANY($2)) as total_paid,
          COUNT(*) FILTER (WHERE stage = ANY($3)) as total_completed
        FROM ${table}
        ${whereClause}
      `;
    };

    const signedUpQuery = (table) => {
      let whereClause = '';
      let params = [];
      
      // Special handling for courses - count all deals except lost
      if (table === 'courses') {
        if (dateRange === 'all' && oldestDate) {
          whereClause = `WHERE stage IS NOT NULL AND stage != '' AND stage != 'Втрачено' AND created_at >= $1`;
          params = [oldestDate];
        } else if (dateRange !== 'all') {
          whereClause = `WHERE stage IS NOT NULL AND stage != '' AND stage != 'Втрачено' AND created_at >= NOW() - INTERVAL '${dateRange}'`;
        } else {
          whereClause = `WHERE stage IS NOT NULL AND stage != '' AND stage != 'Втрачено'`;
        }
      } else {
        // Original logic for other types
        if (dateRange === 'all' && oldestDate) {
          whereClause = `WHERE stage = ANY($1) AND created_at >= $2`;
          params = [signedUpStages[table], oldestDate];
        } else if (dateRange !== 'all') {
          whereClause = `WHERE stage = ANY($1) AND created_at >= NOW() - INTERVAL '${dateRange}'`;
          params = [signedUpStages[table]];
        } else {
          whereClause = `WHERE stage = ANY($1)`;
          params = [signedUpStages[table]];
        }
      }
      
      return {
        sql: `SELECT COUNT(*) FROM ${table} ${whereClause}`,
        params
      };
    };

    if (type === 'all' || type === 'courses') {
      const queryParams = dateRange === 'all' && oldestDate 
        ? [interestedStages, coursePaidStatuses, completedStatuses, oldestDate]
        : [interestedStages, coursePaidStatuses, completedStatuses];
      const courseStats = await pool.query(query('course_deals'), queryParams);
      // Get signed up count (use correct stages for 'courses')
      const signedUpQueryData = signedUpQuery('courses');
      signedUpQueryData.sql = signedUpQueryData.sql.replace('FROM courses', 'FROM course_deals');
      const signedUpRes = await pool.query(signedUpQueryData.sql, signedUpQueryData.params);
      const stat = courseStats.rows[0];
      const total_signed_up = parseInt(signedUpRes.rows[0].count);
      const conversion = total_signed_up > 0 ? Math.round((parseInt(stat.total_paid) / total_signed_up) * 100) : 0;
      stats.courses = { ...stat, total_signed_up, conversion };
    }
    
    if (type === 'all' || type === 'seminars') {
      // For seminars, paid = paidStatuses + completedStatuses
      const seminarPaidOrCompletedStatuses = [...paidStatuses, ...completedStatuses];
      const queryParams = dateRange === 'all' && oldestDate 
        ? [interestedStages, seminarPaidOrCompletedStatuses, completedStatuses, oldestDate]
        : [interestedStages, seminarPaidOrCompletedStatuses, completedStatuses];
      const seminarStats = await pool.query(query('seminars'), queryParams);
      const signedUpQueryData = signedUpQuery('seminars');
      const signedUpRes = await pool.query(signedUpQueryData.sql, signedUpQueryData.params);
      const stat = seminarStats.rows[0];
      const total_signed_up = parseInt(signedUpRes.rows[0].count);
      const conversion = total_signed_up > 0 ? Math.round((parseInt(stat.total_paid) / total_signed_up) * 100) : 0;
      stats.seminars = { ...stat, total_signed_up, conversion };
    }
    
    if (type === 'all' || type === 'webinars') {
      const queryParams = dateRange === 'all' && oldestDate 
        ? [webinarInterestedStages, webinarPaidStatuses, completedStatuses, oldestDate]
        : [webinarInterestedStages, webinarPaidStatuses, completedStatuses];
      const webinarStats = await pool.query(webinarQuery('webinars'), queryParams);
      const signedUpQueryData = signedUpQuery('webinars');
      const signedUpRes = await pool.query(signedUpQueryData.sql, signedUpQueryData.params);
      const stat = webinarStats.rows[0];
      const total_signed_up = parseInt(signedUpRes.rows[0].count);
      const conversion = total_signed_up > 0 ? Math.round((parseInt(stat.total_paid) / total_signed_up) * 100) : 0;
      stats.webinars = { ...stat, total_signed_up, conversion };
    }
    
    // Calculate totals
    const totals = {
      total_interested: 0,
      total_paid: 0,
      total_completed: 0,
      total_signed_up: 0,
      conversion: 0
    };
    
    Object.values(stats).forEach(stat => {
      totals.total_interested += parseInt(stat.total_interested) || 0;
      totals.total_paid += parseInt(stat.total_paid) || 0;
      totals.total_completed += parseInt(stat.total_completed) || 0;
      totals.total_signed_up += parseInt(stat.total_signed_up) || 0;
    });
    totals.conversion = totals.total_signed_up > 0
      ? Math.round((totals.total_paid / totals.total_signed_up) * 100)
      : 0;
    res.json({ stats, totals });
  } catch (error) {
    console.error('Error fetching learning overview:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/learning/trends
// Query params: type, dateRange, start, end
router.get('/learning/trends', authenticateToken, requireManager, async (req, res) => {
  const { type = 'all', dateRange = '90d', start, end } = req.query;
  try {
    let where = [];
    let params = [];
    
    // Get the oldest record date if using 'all' time range
    let oldestDate = null;
    if (dateRange === 'all') {
      oldestDate = await getOldestRecordDate();
    }
    
    // If 'all' or missing, do not add a date filter
    if (start) {
      where.push(`created_at >= $${params.length + 1}`);
      params.push(start);
    } else if (dateRange === 'all' && oldestDate) {
      where.push(`created_at >= $${params.length + 1}`);
      params.push(oldestDate);
    } else if (dateRange && dateRange !== 'all') {
      where.push(`created_at >= NOW() - INTERVAL '${dateRange}'`);
    }
    if (end) {
      where.push(`created_at <= $${params.length + 1}`);
      params.push(end);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const query = (table) => `
      SELECT
        to_char(created_at, 'YYYY-MM-DD') as day,
        COUNT(*) FILTER (WHERE stage = ANY($${params.length + 1}::text[])) as paid,
        COUNT(*) FILTER (WHERE stage = ANY($${params.length + 2}::text[])) as enrolled,
        COUNT(*) FILTER (WHERE stage = ANY($${params.length + 3}::text[])) as completed
      FROM ${table}
      ${whereClause}
      GROUP BY day
      ORDER BY day
    `;
    let trends = [];
    if (type === 'all' || type === 'courses') {
      const queryParams = [...params, coursePaidStatuses, enrolledStatuses, completedStatuses];
      const courseTrends = await pool.query(query('course_deals'), queryParams);
      trends = trends.concat(courseTrends.rows.map(row => ({ ...row, type: 'courses' })));
    }
    if (type === 'all' || type === 'seminars') {
      const queryParams = [...params, paidStatuses, enrolledStatuses, completedStatuses];
      const seminarTrends = await pool.query(query('seminars'), queryParams);
      trends = trends.concat(seminarTrends.rows.map(row => ({ ...row, type: 'seminars' })));
    }
    if (type === 'all' || type === 'webinars') {
      const queryParams = [...params, webinarPaidStatuses, enrolledStatuses, completedStatuses];
      const webinarTrends = await pool.query(query('webinars'), queryParams);
      trends = trends.concat(webinarTrends.rows.map(row => ({ ...row, type: 'webinars' })));
    }
    res.json(trends);
  } catch (error) {
    console.error('Error fetching learning trends:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/learning/top-products
// Query params: type, limit, dateRange
router.get('/learning/top-products', authenticateToken, requireManager, async (req, res) => {
  const { type = 'all', limit = 10, dateRange = '30d' } = req.query;
  try {
    let topProducts = [];
    
    // Get the oldest record date if using 'all' time range
    let oldestDate = null;
    if (dateRange === 'all') {
      oldestDate = await getOldestRecordDate();
    }
    
    const query = (table) => {
      let where = [];
      let params = [];
      where.push("name IS NOT NULL AND trim(name) <> ''");
      
      if (dateRange === 'all' && oldestDate) {
        where.push(`created_at >= $${params.length + 5}`);
        params.push(oldestDate);
      } else if (dateRange && dateRange !== 'all') {
        where.push(`created_at >= NOW() - INTERVAL '${dateRange}'`);
      }
      
      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      return {
        sql: `
          SELECT 
            lower(trim(name)) as normalized_name,
            COUNT(*) FILTER (WHERE stage = ANY($2::text[])) as total_paid,
            COUNT(*) FILTER (WHERE stage = ANY($3::text[])) as total_enrolled,
            COUNT(*) FILTER (WHERE stage = ANY($4::text[])) as total_completed
          FROM ${table}
          ${whereClause}
          GROUP BY lower(trim(name))
          ORDER BY total_paid DESC
          LIMIT $1
        `,
        params: [limit, coursePaidStatuses, enrolledStatuses, completedStatuses, ...params]
      };
    };
    
    if (type === 'all' || type === 'courses') {
      const queryData = query('course_deals');
      const courseProducts = await pool.query(queryData.sql, queryData.params);
      topProducts = topProducts.concat(courseProducts.rows.map(row => ({ ...row, type: 'courses' })));
    }
    if (type === 'all' || type === 'seminars') {
      const queryData = query('seminars');
      const seminarProducts = await pool.query(queryData.sql, queryData.params);
      topProducts = topProducts.concat(seminarProducts.rows.map(row => ({ ...row, type: 'seminars' })));
    }
    if (type === 'all' || type === 'webinars') {
      // Use webinar-specific statuses for webinars
      const webinarQuery = (table) => {
        let where = [];
        let params = [];
        where.push("name IS NOT NULL AND trim(name) <> ''");
        
        if (dateRange === 'all' && oldestDate) {
          where.push(`created_at >= $${params.length + 5}`);
          params.push(oldestDate);
        } else if (dateRange && dateRange !== 'all') {
          where.push(`created_at >= NOW() - INTERVAL '${dateRange}'`);
        }
        
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        return {
          sql: `
            SELECT 
              lower(trim(name)) as normalized_name,
              COUNT(*) FILTER (WHERE stage = ANY($2::text[])) as total_paid,
              COUNT(*) FILTER (WHERE stage = ANY($3::text[])) as total_enrolled,
              COUNT(*) FILTER (WHERE stage = ANY($4::text[])) as total_completed
            FROM ${table}
            ${whereClause}
            GROUP BY lower(trim(name))
            ORDER BY total_paid DESC
            LIMIT $1
          `,
          params: [limit, webinarPaidStatuses, enrolledStatuses, completedStatuses, ...params]
        };
      };
      
      const queryData = webinarQuery('webinars');
      const webinarProducts = await pool.query(queryData.sql, queryData.params);
      topProducts = topProducts.concat(webinarProducts.rows.map(row => ({ ...row, type: 'webinars' })));
    }
    // Sort by total_paid and limit
    topProducts.sort((a, b) => (parseInt(b.total_paid) || 0) - (parseInt(a.total_paid) || 0));
    topProducts = topProducts.slice(0, parseInt(limit));
    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/learning/products
// Query params: type, search, limit, offset
router.get('/learning/products', authenticateToken, requireManager, async (req, res) => {
  const { type = 'all', search = '', limit = 50, offset = 0 } = req.query;
  
  try {
    let products = [];
    
    if (type === 'all' || type === 'courses') {
      let whereClause = '';
      let params = [];
      
      if (search) {
        whereClause = 'WHERE lower(name) LIKE $1';
        params.push(`%${search.toLowerCase()}%`);
      }
      
      const courseProducts = await pool.query(`
        SELECT 
          'courses' as type,
          name,
          stage,
          manager_responsible,
          created_at,
          record_id
        FROM course_deals
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]);
      
      products = products.concat(courseProducts.rows);
    }
    
    if (type === 'all' || type === 'seminars') {
      let whereClause = '';
      let params = [];
      
      if (search) {
        whereClause = 'WHERE lower(name) LIKE $1';
        params.push(`%${search.toLowerCase()}%`);
      }
      
      const seminarProducts = await pool.query(`
        SELECT 
          'seminars' as type,
          name,
          stage,
          manager_responsible,
          created_at,
          record_id
        FROM seminars
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]);
      
      products = products.concat(seminarProducts.rows);
    }
    
    if (type === 'all' || type === 'webinars') {
      let whereClause = '';
      let params = [];
      
      if (search) {
        whereClause = 'WHERE lower(name) LIKE $1';
        params.push(`%${search.toLowerCase()}%`);
      }
      
      const webinarProducts = await pool.query(`
        SELECT 
          'webinars' as type,
          name,
          stage,
          manager_responsible,
          created_at,
          record_id
        FROM webinars
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]);
      
      products = products.concat(webinarProducts.rows);
    }
    
    // Sort by created_at DESC
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching learning products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Students Analytics ---

// GET /api/students
// Fetches a list of students with aggregated analytics.
// Supports filtering by segment and searching by name/email.
router.get('/students', authenticateToken, requireManager, async (req, res) => {
  const { segment, search } = req.query;

  try {
    let whereClauses = [];
    let queryParams = [];

    if (search) {
      queryParams.push(`%${search.toLowerCase()}%`);
      whereClauses.push(`(lower(c.name) LIKE $${queryParams.length} OR lower(c.email) LIKE $${queryParams.length})`);
    }

    // This subquery defines the student segments based on their total number of deals.
    const segmentSubQuery = `
      CASE
        WHEN d.total_deals >= 5 THEN 'power_user'
        WHEN d.total_deals >= 2 THEN 'repeat_student'
        WHEN d.total_deals = 1 THEN 'new_student'
        ELSE 'potential_student'
      END
    `;

    if (segment) {
      queryParams.push(segment);
      whereClauses.push(`${segmentSubQuery} = $${queryParams.length}`);
    }
    
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      WITH deal_counts AS (
        SELECT
          TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) as extracted_contact_id,
          COUNT(*) as total_deals,
          COUNT(*) FILTER (WHERE stage = ANY($${queryParams.length + 1})) as completed_deals,
          MAX(created_at) as last_activity
        FROM (
          SELECT contact_record_id, stage, created_at FROM course_deals WHERE contact_record_id IS NOT NULL AND contact_record_id <> ''
          UNION ALL
          SELECT contact_record_id, stage, created_at FROM seminars WHERE contact_record_id IS NOT NULL AND contact_record_id <> ''
          UNION ALL
          SELECT contact_record_id, stage, created_at FROM webinars WHERE contact_record_id IS NOT NULL AND contact_record_id <> ''
        ) as all_deals
        GROUP BY TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id))
      )
      SELECT
        c.record_id,
        c.name,
        c.email,
        c.phone_number,
        COALESCE(d.total_deals, 0) as total_enrollments,
        COALESCE(d.completed_deals, 0) as total_completions,
        d.last_activity,
        ${segmentSubQuery} as segment
      FROM contacts c
      LEFT JOIN deal_counts d ON c.record_id = d.extracted_contact_id
      ${whereClause}
      ORDER BY d.last_activity DESC NULLS LAST;
    `;
    
    // Add completedStatuses for the subquery filter
    queryParams.push(completedStatuses);

    const result = await pool.query(sql, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/students/leaderboard
// Fetches top 10 students by total number of paid deals.
router.get('/students/leaderboard', authenticateToken, requireManager, async (req, res) => {
  try {
    const sql = `
      WITH paid_deals AS (
        SELECT TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) as extracted_contact_id 
        FROM course_deals WHERE stage = ANY($1) AND contact_record_id IS NOT NULL AND contact_record_id <> ''
        UNION ALL
        SELECT TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) as extracted_contact_id 
        FROM seminars WHERE stage = ANY($1) AND contact_record_id IS NOT NULL AND contact_record_id <> ''
        UNION ALL
        SELECT TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) as extracted_contact_id 
        FROM webinars WHERE stage = ANY($1) AND contact_record_id IS NOT NULL AND contact_record_id <> ''
      )
      SELECT
        c.name,
        c.email,
        COUNT(pd.extracted_contact_id) as purchase_count
      FROM contacts c
      JOIN paid_deals pd ON c.record_id = pd.extracted_contact_id
      GROUP BY c.record_id, c.name, c.email
      ORDER BY purchase_count DESC
      LIMIT 10;
    `;
    const result = await pool.query(sql, [coursePaidStatuses]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/students/:id
// Fetches detailed information for a single student, including their full deal history.
router.get('/students/:id', authenticateToken, requireManager, async (req, res) => {
  const { id } = req.params;
  try {
    const studentQuery = 'SELECT record_id, name, email, phone_number, created_at FROM contacts WHERE record_id = $1';
    const studentResult = await pool.query(studentQuery, [id]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentResult.rows[0];

    const dealsQuery = `
      SELECT 'Курс' as type, name, stage, created_at FROM course_deals WHERE TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) = $1
      UNION ALL
      SELECT 'Семінар' as type, name, stage, created_at FROM seminars WHERE TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) = $1
      UNION ALL
      SELECT 'Вебінар' as type, name, stage, created_at FROM webinars WHERE TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) = $1
      ORDER BY created_at DESC;
    `;
    const dealsResult = await pool.query(dealsQuery, [id]);
    
    student.deals = dealsResult.rows;
    res.json(student);
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/engagement-over-time
// Returns monthly active student counts for seminars, webinars, and МНП courses combined
router.get('/engagement-over-time', authenticateToken, requireManager, async (req, res) => {
  try {
    const client = await pool.connect();
    // Helper SQL for each table
    const seminarSQL = `
      SELECT DATE_TRUNC('month', created_at) AS month, TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) AS student_id
      FROM seminars
      WHERE contact_record_id IS NOT NULL AND contact_record_id <> ''
    `;
    const webinarSQL = `
      SELECT DATE_TRUNC('month', created_at) AS month, TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) AS student_id
      FROM webinars
      WHERE contact_record_id IS NOT NULL AND contact_record_id <> ''
    `;
    const mnpSQL = `
      SELECT DATE_TRUNC('month', created_at) AS month, TRIM(BOTH '"' FROM TRIM(BOTH '{}' FROM contact_record_id)) AS student_id
      FROM course_deals
      WHERE name ILIKE '%МНП%' AND contact_record_id IS NOT NULL AND contact_record_id <> ''
    `;
    // Run all queries
    const [seminarRes, webinarRes, mnpRes] = await Promise.all([
      client.query(seminarSQL),
      client.query(webinarSQL),
      client.query(mnpSQL)
    ]);
    client.release();
    // Combine all rows
    const allRows = [...seminarRes.rows, ...webinarRes.rows, ...mnpRes.rows];
    // Group by month and unique student_id
    const monthMap = {};
    allRows.forEach(row => {
      const month = row.month.toISOString().slice(0, 7); // 'YYYY-MM'
      if (!monthMap[month]) monthMap[month] = new Set();
      if (row.student_id) monthMap[month].add(row.student_id);
    });
    // Format result
    const result = Object.entries(monthMap)
      .map(([month, students]) => ({ month, active_students: students.size }))
      .sort((a, b) => a.month.localeCompare(b.month));
    res.json(result);
  } catch (err) {
    console.error('Error in /api/engagement-over-time:', err);
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
});

// --- Advertising Analytics Endpoints ---

// GET /api/ads/summary
// Returns conversions and revenue by channel
router.get('/ads/summary', authenticateToken, requireManager, async (req, res) => {
  try {
    const sql = `
      SELECT
        COALESCE(utm_source, source, 'Інше') AS channel,
        COUNT(*) FILTER (WHERE stage = ANY($1)) AS conversions,
        SUM(course_price) FILTER (WHERE stage = ANY($1)) AS revenue
      FROM course_deals
      WHERE (utm_source IS NOT NULL OR source IS NOT NULL)
      GROUP BY channel
      ORDER BY conversions DESC;
    `;
    const paidStages = [
      'Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена',
      'Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар',
      'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар'
    ];
    const result = await pool.query(sql, [paidStages]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/ads/summary:', err);
    res.status(500).json({ error: 'Failed to fetch ad summary' });
  }
});

// GET /api/ads/trends
// Returns monthly conversions by channel
router.get('/ads/trends', authenticateToken, requireManager, async (req, res) => {
  try {
    const sql = `
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COALESCE(utm_source, source, 'Інше') AS channel,
        COUNT(*) FILTER (WHERE stage = ANY($1)) AS conversions,
        SUM(course_price) FILTER (WHERE stage = ANY($1)) AS revenue
      FROM course_deals
      WHERE (utm_source IS NOT NULL OR source IS NOT NULL)
      GROUP BY month, channel
      ORDER BY month, channel;
    `;
    const paidStages = [
      'Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена',
      'Записано', 'Нова заявка', 'Залишив заявку', 'Нова реєстрація', 'Реєстрація на семінар',
      'Курс пройдено', 'Семінар пройдено', 'Подивився вебінар'
    ];
    const result = await pool.query(sql, [paidStages]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/ads/trends:', err);
    res.status(500).json({ error: 'Failed to fetch ad trends' });
  }
});

// --- Managers Analytics Endpoints ---

// GET /api/managers/summary
// Returns total deals, revenue, completed deals, and lost deals per manager
router.get('/managers/summary', authenticateToken, requireManager, async (req, res) => {
  try {
    const sql = `
      SELECT
        manager_responsible AS manager,
        COUNT(*) AS total_deals,
        SUM(course_price) FILTER (WHERE stage IN ('Курс пройдено', 'Передплата отримана', 'Оплачено')) AS revenue,
        COUNT(*) FILTER (WHERE stage IN ('Курс пройдено', 'Передплата отримана', 'Оплачено')) AS completed_deals,
        COUNT(*) FILTER (WHERE stage = 'Втрачено') AS lost_deals
      FROM course_deals
      WHERE manager_responsible IS NOT NULL AND manager_responsible <> ''
      GROUP BY manager_responsible
      ORDER BY revenue DESC NULLS LAST;
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/managers/summary:', err);
    res.status(500).json({ error: 'Failed to fetch manager summary' });
  }
});

// GET /api/managers/trends
// Returns monthly deals and revenue per manager
router.get('/managers/trends', authenticateToken, requireManager, async (req, res) => {
  try {
    const sql = `
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        manager_responsible AS manager,
        COUNT(*) AS total_deals,
        SUM(course_price) AS revenue
      FROM course_deals
      WHERE manager_responsible IS NOT NULL AND manager_responsible <> ''
      GROUP BY month, manager_responsible
      ORDER BY month, manager;
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/managers/trends:', err);
    res.status(500).json({ error: 'Failed to fetch manager trends' });
  }
});

// --- Funnel Analytics Endpoint ---

/**
 * GET /api/funnels/:type
 * Query params: start, end
 * :type = 'webinars' | 'seminars' | 'courses'
 * Returns: [{ stage, label, count, lost }]
 */
router.get('/funnels/:type', authenticateToken, requireManager, async (req, res) => {
  const { type } = req.params;
  let { start, end, dateRange } = req.query;
  let oldestDate = null;
  if (dateRange === 'all') {
    oldestDate = await getOldestRecordDate();
    if (oldestDate && !start) {
      start = oldestDate;
    }
  }
  // Define funnel steps (exclude 'Втрачено')
  const funnelSteps = {
    webinars: [
      { label: 'Реєстрація', stages: ['Нова реєстрація', 'Залишив заявку'] },
      { label: 'Оплата', stages: ['Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена'] },
      { label: 'Вебінар переглянуто', stages: ['Подивився вебінар'] },
      { label: 'Кваліфікований', stages: ['Кваліфікований'] },
    ],
    seminars: [
      { label: 'Реєстрація', stages: ['Реєстрація на семінар', 'Записано'] },
      { label: 'Кваліфікація', stages: ['Кваліфікований', 'Не кваліфікований'] },
      { label: 'Передплата', stages: ['Предоплата проведена'] },
      { label: 'Оплата', stages: ['Сплачено'] },
      { label: 'Семінар пройдено', stages: ['Семінар пройдено'] },
    ],
    courses: [
      { label: 'Записано', stages: ['Записано', 'Нова заявка'] },
      { label: 'Презентація', stages: ['Презентація проведена'] },
      { label: 'Передплата', stages: ['Передплата отримана'] },
      { label: 'Оплата', stages: ['Оплачено'] },
      { label: 'Курс пройдено', stages: ['Курс пройдено'] },
    ],
  };
  // Conversion stages for each type
  const conversionStages = {
    webinars: ['Кваліфікований'],
    seminars: ['Семінар пройдено'],
    courses: ['Курс пройдено'],
  };
  const dealTypeMap = { webinars: 'webinars', seminars: 'seminars', courses: 'course_deals' };
  const steps = funnelSteps[type];
  const tableName = dealTypeMap[type];
  if (!steps || !tableName) return res.status(400).json({ error: 'Invalid funnel type' });
  try {
    let where = [];
    let params = [];
    if (dateRange && dateRange !== 'all') {
      where.push(`created_at >= NOW() - INTERVAL '${dateRange}'`);
    } else if (start) {
      where.push(`created_at >= $${params.length + 1}`);
      params.push(start);
    }
    if (end) {
      where.push(`created_at <= $${params.length + 1}`);
      params.push(end);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = type === 'courses'
      ? `SELECT record_id, phone, email, contact_record_id, stage FROM ${tableName} ${whereClause}`
      : type === 'webinars'
        ? `SELECT record_id, phone, email, contact_record_id, stage FROM ${tableName} ${whereClause}`
        : `SELECT record_id, contact_record_id, stage FROM ${tableName} ${whereClause}`;
    const result = await pool.query(sql, params);
    const rows = result.rows;
    // Always define stepStages for all types
    const stepStages = steps.map(s => s.stages);
    let dealMaxStep = {};
    let lost = 0, converted = 0;
    if (type === 'courses' || type === 'webinars') {
      for (const row of rows) {
        // Get unique lead id
        const uniqueId = row.phone && row.phone.trim() ? row.phone.trim() : (row.email && row.email.trim() ? row.email.trim() : (row.contact_record_id && row.contact_record_id.trim() ? row.contact_record_id.trim() : null));
        if (!uniqueId) continue;
        if (row.stage === 'Втрачено') continue;
        for (let i = stepStages.length - 1; i >= 0; i--) {
          if (stepStages[i].includes(row.stage)) {
            if (!(uniqueId in dealMaxStep) || dealMaxStep[uniqueId] < i) {
              dealMaxStep[uniqueId] = i;
            }
            break;
          }
        }
      }
    } else if (type === 'seminars') {
      for (const row of rows) {
        const uniqueId = row.contact_record_id && row.contact_record_id.trim() ? row.contact_record_id.trim() : null;
        if (!uniqueId) continue;
        if (row.stage === 'Втрачено') continue;
        for (let i = stepStages.length - 1; i >= 0; i--) {
          if (stepStages[i].includes(row.stage)) {
            if (!(uniqueId in dealMaxStep) || dealMaxStep[uniqueId] < i) {
              dealMaxStep[uniqueId] = i;
            }
            break;
          }
        }
      }
    } else {
      for (const row of rows) {
        if (row.stage === 'Втрачено') continue;
        for (let i = stepStages.length - 1; i >= 0; i--) {
          if (stepStages[i].includes(row.stage)) {
            if (!(row.record_id in dealMaxStep) || dealMaxStep[row.record_id] < i) {
              dealMaxStep[row.record_id] = i;
            }
            break;
          }
        }
      }
    }
    // For each step, count unique leads whose max step is at or beyond this step
    let funnel = [];
    if (type === 'courses' || type === 'webinars') {
      // Use a single SQL query to get unique leads at or beyond each grouped step
      const stepOrderSql = `WITH step_order AS (
        SELECT 0 AS idx, 'Записано/Нова заявка' AS step_label, ARRAY['Записано', 'Нова заявка'] AS stages
        UNION ALL SELECT 1, 'Презентація проведена', ARRAY['Презентація проведена']
        UNION ALL SELECT 2, 'Передплата отримана', ARRAY['Передплата отримана']
        UNION ALL SELECT 3, 'Оплачено', ARRAY['Оплачено']
        UNION ALL SELECT 4, 'Курс пройдено', ARRAY['Курс пройдено']
      ),
      deals_with_idx AS (
        SELECT
          COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) AS lead_id,
          d.stage,
          so.idx
        FROM course_deals d
        JOIN step_order so ON d.stage = ANY(so.stages)
        WHERE COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) IS NOT NULL
          AND COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) <> ''
      ),
      furthest_step AS (
        SELECT
          lead_id,
          MAX(idx) AS max_idx
        FROM deals_with_idx
        GROUP BY lead_id
      )
      SELECT
        so.idx,
        so.step_label,
        COUNT(DISTINCT fs.lead_id) AS unique_leads_at_or_beyond
      FROM step_order so
      LEFT JOIN furthest_step fs ON fs.max_idx >= so.idx
      GROUP BY so.idx, so.step_label
      ORDER BY so.idx;`;
      const funnelRes = await pool.query(stepOrderSql);
      funnel = funnelRes.rows.map(row => ({
        label: row.step_label,
        count: parseInt(row.unique_leads_at_or_beyond) || 0,
        dropped: 0 // Dropped will be calculated below
      }));
      // Calculate dropped for each step
      let prevCount = null;
      for (let i = 0; i < funnel.length; i++) {
        if (prevCount !== null) {
          funnel[i].dropped = prevCount - funnel[i].count;
        }
        prevCount = funnel[i].count;
      }
    } else {
      let prevCount = null;
      for (let i = 0; i < steps.length; i++) {
        const count = Object.values(dealMaxStep).filter(idx => idx >= i).length;
        let dropped = 0;
        if (prevCount !== null) {
          dropped = prevCount - count;
        }
        funnel.push({ label: steps[i].label, count, dropped });
        prevCount = count;
      }
    }
    // Calculate total unique leads (by phone/email/contact_record_id)
    let totalLeads = 0;
    // Calculate unique converted and lost for courses
    if (type === 'courses' || type === 'webinars') {
      const leadsRes = await pool.query(`SELECT COUNT(DISTINCT COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id)) AS cnt FROM ${tableName} WHERE COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) IS NOT NULL AND COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) <> ''`);
      totalLeads = parseInt(leadsRes.rows[0].cnt) || 0;
      if (type === 'courses') {
        const convertedRes = await pool.query(`SELECT COUNT(DISTINCT COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id)) AS cnt FROM course_deals WHERE stage = 'Курс пройдено' AND COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) IS NOT NULL AND COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) <> ''`);
        converted = parseInt(convertedRes.rows[0].cnt) || 0;
        const lostRes = await pool.query(`SELECT COUNT(DISTINCT COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id)) AS cnt FROM course_deals WHERE stage = 'Втрачено' AND COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) IS NOT NULL AND COALESCE(NULLIF(phone, ''), NULLIF(email, ''), contact_record_id) <> ''`);
        lost = parseInt(lostRes.rows[0].cnt) || 0;
      }
    } else if (type === 'seminars') {
      const leadsRes = await pool.query(`SELECT COUNT(DISTINCT contact_record_id) AS cnt FROM seminars WHERE contact_record_id IS NOT NULL AND contact_record_id <> ''`);
      totalLeads = parseInt(leadsRes.rows[0].cnt) || 0;
    } else {
      // ... existing code for other types ...
    }
    res.json({ funnel, lost, converted, totalLeads });
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/debug/compare
// Debug endpoint to compare learning vs funnels data
router.get('/debug/compare', authenticateToken, requireAdmin, async (req, res) => {
  const { type = 'courses', dateRange = 'all' } = req.query;
  
  try {
    // Get the oldest record date if using 'all' time range
    let oldestDate = null;
    if (dateRange === 'all') {
      oldestDate = await getOldestRecordDate();
    }
    
    // Build WHERE clause for date filtering
    let where = [];
    let params = [];
    if (dateRange && dateRange !== 'all') {
      where.push(`created_at >= NOW() - INTERVAL '${dateRange}'`);
    } else if (oldestDate) {
      where.push(`created_at >= $${params.length + 1}`);
      params.push(oldestDate);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    
    // Map type to table
    const tableMap = { webinars: 'webinars', seminars: 'seminars', courses: 'course_deals' };
    const tableName = tableMap[type];
    
    if (!tableName) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    // Get all records for this type and time period
    const allRecordsSql = `
      SELECT record_id, stage, created_at, name
      FROM ${tableName}
      ${whereClause}
      ORDER BY created_at DESC
    `;
    
    const allRecords = await pool.query(allRecordsSql, params);
    
    // Learning endpoint logic
    let learningStats = {};
    if (type === 'courses') {
      const learningSql = `
        SELECT 
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 1}::text[])) as total_interested,
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 2}::text[])) as total_paid,
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 3}::text[])) as total_completed
        FROM ${tableName}
        ${whereClause}
      `;
      const learningParams = [...params, interestedStages, coursePaidStatuses, completedStatuses];
      const learningResult = await pool.query(learningSql, learningParams);
      learningStats = learningResult.rows[0];
    } else if (type === 'seminars') {
      const seminarPaidOrCompletedStatuses = [...paidStatuses, ...completedStatuses];
      const learningSql = `
        SELECT 
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 1}::text[])) as total_interested,
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 2}::text[])) as total_paid,
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 3}::text[])) as total_completed
        FROM ${tableName}
        ${whereClause}
      `;
      const learningParams = [...params, interestedStages, seminarPaidOrCompletedStatuses, completedStatuses];
      const learningResult = await pool.query(learningSql, learningParams);
      learningStats = learningResult.rows[0];
    } else if (type === 'webinars') {
      const learningSql = `
        SELECT 
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 1}::text[])) as total_interested,
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 2}::text[])) as total_paid,
          COUNT(*) FILTER (WHERE stage = ANY($${params.length + 3}::text[])) as total_completed
        FROM ${tableName}
        ${whereClause}
      `;
      const learningParams = [...params, webinarInterestedStages, webinarPaidStatuses, completedStatuses];
      const learningResult = await pool.query(learningSql, learningParams);
      learningStats = learningResult.rows[0];
    }
    
    // Funnel endpoint logic
    const funnelSteps = {
      webinars: [
        { label: 'Реєстрація', stages: ['Нова реєстрація', 'Залишив заявку'] },
        { label: 'Оплата', stages: ['Сплачено', 'Оплачено', 'Передплата отримана', 'Предоплата проведена'] },
        { label: 'Вебінар переглянуто', stages: ['Подивився вебінар'] },
        { label: 'Кваліфікований', stages: ['Кваліфікований'] },
      ],
      seminars: [
        { label: 'Реєстрація', stages: ['Реєстрація на семінар', 'Записано'] },
        { label: 'Кваліфікація', stages: ['Кваліфікований', 'Не кваліфікований'] },
        { label: 'Передплата', stages: ['Предоплата проведена'] },
        { label: 'Оплата', stages: ['Сплачено'] },
        { label: 'Семінар пройдено', stages: ['Семінар пройдено'] },
      ],
      courses: [
        { label: 'Записано', stages: ['Записано', 'Нова заявка'] },
        { label: 'Презентація', stages: ['Презентація проведена'] },
        { label: 'Передплата', stages: ['Передплата отримана'] },
        { label: 'Оплата', stages: ['Оплачено'] },
        { label: 'Курс пройдено', stages: ['Курс пройдено'] },
      ],
    };
    
    const steps = funnelSteps[type];
    const stepStages = steps.map(s => s.stages);
    
    // Map: record_id -> furthest step index based on current stage
    let dealMaxStep = {};
    for (const row of allRecords.rows) {
      for (let i = stepStages.length - 1; i >= 0; i--) {
        if (stepStages[i].includes(row.stage)) {
          dealMaxStep[row.record_id] = i;
          break;
        }
      }
    }
    
    // For each step, count deals whose max step is at or beyond this step
    let funnelOutput = [];
    let prevCount = null;
    for (let i = 0; i < steps.length; i++) {
      const count = Object.values(dealMaxStep).filter(idx => idx >= i).length;
      let lost = 0;
      if (prevCount !== null) {
        lost = prevCount - count;
      }
      funnelOutput.push({ label: steps[i].label, count, lost });
      prevCount = count;
    }
    
    // Stage breakdown
    const stageBreakdown = {};
    allRecords.rows.forEach(row => {
      if (!stageBreakdown[row.stage]) {
        stageBreakdown[row.stage] = 0;
      }
      stageBreakdown[row.stage]++;
    });
    
    res.json({
      type,
      dateRange,
      oldestDate,
      totalRecords: allRecords.rows.length,
      learningStats,
      funnelOutput,
      stageBreakdown,
      stageDefinitions: {
        interestedStages: type === 'courses' ? interestedStages : (type === 'webinars' ? webinarInterestedStages : interestedStages),
        paidStatuses: type === 'courses' ? coursePaidStatuses : (type === 'webinars' ? webinarPaidStatuses : paidStatuses),
        completedStatuses,
        funnelSteps: steps
      }
    });
  } catch (error) {
    console.error('Error in debug compare:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/debug/statuses
router.get('/debug/statuses', authenticateToken, requireAdmin, async (req, res) => {
  res.json({
    paidStatuses,
    webinarPaidStatuses,
    completedStatuses,
    interestedStages,
    webinarInterestedStages,
    allStages
  });
});

// --- Funnel History Analytics Endpoints ---

// GET /api/funnels/history/:type
// Returns how many unique deals ever reached each stage (cumulative)
router.get('/funnels/history/:type', authenticateToken, requireManager, async (req, res) => {
  const { type } = req.params; // 'webinar', 'seminar', 'course'
  const { start, end } = req.query;

  let dateFilter = '';
  let params = [type];
  if (start) {
    dateFilter += ' AND changed_at >= $2';
    params.push(start);
  }
  if (end) {
    dateFilter += ` AND changed_at <= $${params.length + 1}`;
    params.push(end);
  }

  const sql = `
    SELECT new_stage, COUNT(DISTINCT deal_record_id) AS deals_reached
    FROM deal_stage_history
    WHERE deal_type = $1
    ${dateFilter}
    GROUP BY new_stage
    ORDER BY deals_reached DESC
  `;

  const result = await pool.query(sql, params);
  res.json(result.rows);
});

// GET /api/funnels/history/:type/current
// Returns the current stage for each deal
router.get('/funnels/history/:type/current', authenticateToken, requireManager, async (req, res) => {
  const { type } = req.params;
  const sql = `
    SELECT deal_record_id, new_stage AS stage
    FROM (
      SELECT deal_record_id, new_stage, changed_at,
             ROW_NUMBER() OVER (PARTITION BY deal_record_id ORDER BY changed_at DESC) AS rn
      FROM deal_stage_history
      WHERE deal_type = $1
    ) latest
    WHERE rn = 1;
  `;
  const result = await pool.query(sql, [type]);
  res.json(result.rows);
});

// GET /api/funnels/history/:type/time-in-stage
// Returns time spent in each stage for each deal
router.get('/funnels/history/:type/time-in-stage', authenticateToken, requireManager, async (req, res) => {
  const { type } = req.params;
  const sql = `
    SELECT
      deal_record_id,
      new_stage,
      changed_at AS entered_at,
      LEAD(changed_at) OVER (PARTITION BY deal_record_id ORDER BY changed_at) AS exited_at,
      EXTRACT(EPOCH FROM (LEAD(changed_at) OVER (PARTITION BY deal_record_id ORDER BY changed_at) - changed_at)) AS seconds_in_stage
    FROM deal_stage_history
    WHERE deal_type = $1
    ORDER BY deal_record_id, changed_at;
  `;
  const result = await pool.query(sql, [type]);
  res.json(result.rows);
});

// GET /api/funnels/history/:type/as-of
// Returns the funnel as of a specific date
router.get('/funnels/history/:type/as-of', authenticateToken, requireManager, async (req, res) => {
  const { type } = req.params;
  const { asOf } = req.query;
  if (!asOf) return res.status(400).json({ error: 'Missing asOf date' });
  const sql = `
    SELECT new_stage, COUNT(DISTINCT deal_record_id)
    FROM (
      SELECT deal_record_id, new_stage, changed_at,
             ROW_NUMBER() OVER (PARTITION BY deal_record_id ORDER BY changed_at DESC) AS rn
      FROM deal_stage_history
      WHERE changed_at <= $2
        AND deal_type = $1
    ) latest
    WHERE rn = 1
    GROUP BY new_stage;
  `;
  const result = await pool.query(sql, [type, asOf]);
  res.json(result.rows);
});

// Sync endpoint - triggers data synchronization (Admin only)
router.post('/sync', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔄 Sync requested via API');
    
    // Check if sync is already in progress
    if (global.syncInProgress) {
      return res.status(409).json({
        success: false,
        error: 'Sync already in progress',
        message: 'Another sync operation is currently running. Please wait for it to complete.'
      });
    }

    // Run the sync process
    const results = await runSyncWithResults();
    
    res.json({
      success: true,
      message: 'Sync completed successfully',
      data: results
    });
    
  } catch (error) {
    console.error('❌ Sync API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to complete sync operation'
    });
  }
});

// Sync status endpoint - returns sync history and current status (Admin only)
router.get('/sync/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get the latest sync record
    const latestSyncRes = await pool.query(
      'SELECT * FROM sync_history ORDER BY started_at DESC LIMIT 1'
    );
    
    // Get recent sync history (last 10 records)
    const historyRes = await pool.query(
      'SELECT id, triggered_by, started_at, finished_at, status, error FROM sync_history ORDER BY started_at DESC LIMIT 10'
    );
    
    // Get sync statistics
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_syncs,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_syncs,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_syncs,
        AVG(EXTRACT(EPOCH FROM (finished_at - started_at))) as avg_duration_seconds
      FROM sync_history 
      WHERE finished_at IS NOT NULL
    `);
    
    const latestSync = latestSyncRes.rows[0] || null;
    const syncHistory = historyRes.rows || [];
    const stats = statsRes.rows[0] || {};
    
    res.json({
      success: true,
      data: {
        currentStatus: global.syncInProgress ? 'running' : 'idle',
        lastSyncTime: global.lastSyncTime,
        latestSync,
        syncHistory,
        stats: {
          totalSyncs: parseInt(stats.total_syncs) || 0,
          successfulSyncs: parseInt(stats.successful_syncs) || 0,
          failedSyncs: parseInt(stats.failed_syncs) || 0,
          avgDurationSeconds: parseFloat(stats.avg_duration_seconds) || 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Sync status API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch sync status'
    });
  }
});

// --- User Management Endpoints (Admin Only) ---

// GET /api/users - Get all users (Admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  const { email, password, role } = req.body;

  // Validation
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  if (!['admin', 'manager'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either "admin" or "manager"' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
      [email.toLowerCase(), passwordHash, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { email, role, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updateFields = [];
    let params = [];
    let paramIndex = 1;

    // Update email if provided
    if (email) {
      // Check if email is already taken by another user
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email is already taken by another user' });
      }
      updateFields.push(`email = $${paramIndex++}`);
      params.push(email.toLowerCase());
    }

    // Update role if provided
    if (role) {
      if (!['admin', 'manager'].includes(role)) {
        return res.status(400).json({ error: 'Role must be either "admin" or "manager"' });
      }
      updateFields.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const bcrypt = require('bcryptjs');
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updateFields.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, role, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, params);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/users/me - Get current user info
router.get('/users/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/test - Test endpoint (Manager or Admin)
router.get('/test', authenticateToken, requireManager, async (req, res) => {
  res.json({ message: 'Backend is working correctly!' });
});

module.exports = router; 