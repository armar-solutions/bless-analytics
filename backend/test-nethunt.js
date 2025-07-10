const { listFolders } = require('./services/nethunt');

const runTest = async () => {
  console.log('Attempting to fetch folders from NetHunt CRM...');
  try {
    const folders = await listFolders();
    
    if (folders && folders.length > 0) {
      console.log('✅ Successfully fetched folders:');
      console.table(folders);
    } else {
      console.log('🟡 Fetched data, but no folders were found.');
    }
  } catch (error) {
    console.error('🔴 Failed to fetch folders from NetHunt.');
    // The detailed error is already logged by the service
  }
};

runTest(); 