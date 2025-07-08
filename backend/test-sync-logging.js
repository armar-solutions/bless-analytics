const { runSyncWithResults } = require('./sync');
const pool = require('./db/pool');

async function testSyncLogging() {
  console.log('🧪 Testing sync logging functionality...\n');
  
  try {
    // Run a sync
    console.log('📡 Starting sync...');
    const results = await runSyncWithResults();
    
    console.log('\n📊 Sync Results:');
    console.log('- Success:', results.success);
    console.log('- Duration:', results.duration, 'ms');
    console.log('- Errors:', results.errors.length);
    console.log('- Summary:', JSON.stringify(results.summary, null, 2));
    
    // Check sync_history table
    console.log('\n📋 Checking sync_history table...');
    const historyRes = await pool.query(
      'SELECT * FROM sync_history ORDER BY started_at DESC LIMIT 1'
    );
    
    if (historyRes.rows.length > 0) {
      const latestSync = historyRes.rows[0];
      console.log('✅ Latest sync record found:');
      console.log('- ID:', latestSync.id);
      console.log('- Triggered by:', latestSync.triggered_by);
      console.log('- Started at:', latestSync.started_at);
      console.log('- Finished at:', latestSync.finished_at);
      console.log('- Status:', latestSync.status);
      console.log('- Error:', latestSync.error || 'None');
      console.log('- Summary:', JSON.stringify(latestSync.summary, null, 2));
    } else {
      console.log('❌ No sync records found in sync_history table');
    }
    
    // Show all sync history
    console.log('\n📜 All sync history:');
    const allHistoryRes = await pool.query(
      'SELECT id, triggered_by, started_at, finished_at, status FROM sync_history ORDER BY started_at DESC LIMIT 5'
    );
    
    allHistoryRes.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, By: ${row.triggered_by}, Status: ${row.status}, Started: ${row.started_at}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testSyncLogging(); 