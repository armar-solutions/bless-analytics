const pool = require('./pool');

const dropTables = async () => {
  const client = await pool.connect();
  console.log('Dropping all tables...');
  try {
    // We drop tables in reverse order of creation to avoid foreign key issues if they exist.
    await client.query('DROP TABLE IF EXISTS seminars, webinars, course_deals, contacts, users CASCADE;');
    console.log('✅ All tables dropped successfully.');
  } catch (err) {
    console.error('❌ Error dropping tables:', err);
  } finally {
    client.release();
    pool.end();
  }
};

dropTables(); 