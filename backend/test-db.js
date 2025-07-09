require('dotenv').config();
const pool = require('./db/pool');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Test users table
    const usersResult = await pool.query('SELECT COUNT(*) as user_count FROM users');
    console.log('✅ Users table accessible:', usersResult.rows[0]);
    
    // Test specific user
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE email = $1', ['admin@example.com']);
    console.log('✅ Admin user found:', userResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabase(); 