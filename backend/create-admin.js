require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db/pool');

async function createAdminUser() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node create-admin.js <email> <password>');
    console.error('Example: node create-admin.js admin@example.com mypassword123');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      console.error('User already exists with this email');
      process.exit(1);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email.toLowerCase(), passwordHash, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Role:', result.rows[0].role);
    console.log('\nYou can now log in with these credentials.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser(); 