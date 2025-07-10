const fs = require('fs');
const path = require('path');
const pool = require('./pool');

console.log('Connecting to database:', process.env.DB_DATABASE);

// Migration: Create stage_history table if it doesn't exist
async function createStageHistoryTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS stage_history (
      id SERIAL PRIMARY KEY,
      record_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      changed_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

// Migration: Create sync_history table if it doesn't exist
async function createSyncHistoryTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS sync_history (
      id SERIAL PRIMARY KEY,
      triggered_by TEXT,
      started_at TIMESTAMP NOT NULL DEFAULT NOW(),
      finished_at TIMESTAMP,
      status TEXT NOT NULL,
      summary JSONB,
      error TEXT
    );
  `);
}

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  console.log('Starting migrations...');

  for (const file of migrationFiles) {
    if (file.endsWith('.sql')) {
      try {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        console.log(`- Running migration: ${file}`);
        await pool.query(sql);
        console.log(`  ✅ Success: ${file}`);
      } catch (err) {
        console.error(`  ❌ Error running migration ${file}:`, err);
        process.exit(1);
      }
    }
  }

  // Run custom migrations
  await createStageHistoryTable(pool);
  await createSyncHistoryTable(pool);

  console.log('All migrations completed successfully.');
  await pool.end(); // Close the pool only once, at the end
};

runMigrations(); 