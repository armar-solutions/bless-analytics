const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSyncEndpoints() {
  console.log('🧪 Testing sync API endpoints...\n');
  
  try {
    // Test 1: Get sync status
    console.log('📋 Testing GET /api/sync/status...');
    const statusResponse = await axios.get(`${BASE_URL}/sync/status`);
    console.log('✅ Status endpoint response:');
    console.log('- Success:', statusResponse.data.success);
    console.log('- Current status:', statusResponse.data.data.currentStatus);
    console.log('- Total syncs:', statusResponse.data.data.stats.totalSyncs);
    console.log('- Latest sync:', statusResponse.data.data.latestSync ? 'Found' : 'None');
    console.log('');
    
    // Test 2: Trigger a sync (this will take a while)
    console.log('🔄 Testing POST /api/sync...');
    console.log('⚠️  This will trigger a full sync - it may take several minutes...');
    
    const syncResponse = await axios.post(`${BASE_URL}/sync`);
    console.log('✅ Sync endpoint response:');
    console.log('- Success:', syncResponse.data.success);
    console.log('- Message:', syncResponse.data.message);
    console.log('- Duration:', syncResponse.data.data.duration, 'ms');
    console.log('- Summary:', JSON.stringify(syncResponse.data.data.summary, null, 2));
    console.log('');
    
    // Test 3: Get updated status
    console.log('📋 Testing GET /api/sync/status again...');
    const updatedStatusResponse = await axios.get(`${BASE_URL}/sync/status`);
    console.log('✅ Updated status:');
    console.log('- Current status:', updatedStatusResponse.data.data.currentStatus);
    console.log('- Total syncs:', updatedStatusResponse.data.data.stats.totalSyncs);
    console.log('- Latest sync ID:', updatedStatusResponse.data.data.latestSync?.id);
    console.log('');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Check if axios is installed
try {
  require('axios');
  testSyncEndpoints();
} catch (error) {
  console.log('📦 Installing axios for testing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ axios installed, running tests...');
    testSyncEndpoints();
  } catch (installError) {
    console.error('❌ Failed to install axios:', installError.message);
    console.log('Please run: npm install axios');
  }
} 