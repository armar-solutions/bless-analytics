const pool = require('./db/pool');

const checkData = async () => {
  console.log('=== CHECKING SYNCED DATA ===\n');
  
  try {
    // Check contacts
    console.log('📞 CONTACTS:');
    console.log('===========');
    const contactsResult = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    console.log(`Found ${contactsResult.rows.length} contacts:\n`);
    
    contactsResult.rows.forEach((contact, index) => {
      console.log(`${index + 1}. ${contact.name || 'No name'}`);
      console.log(`   Phone: ${contact.phone_number || 'N/A'}`);
      console.log(`   Email: ${contact.email || 'N/A'}`);
      console.log(`   Country: ${contact.country || 'N/A'}`);
      console.log(`   Manager: ${contact.manager_responsible || 'N/A'}`);
      console.log(`   Status: ${contact.contact_status || 'N/A'}`);
      console.log(`   Created: ${contact.created_at || 'N/A'}`);
      console.log(`   Record ID: ${contact.record_id}`);
      console.log('');
    });

    // Check seminars
    console.log('\n🎓 SEMINARS:');
    console.log('===========');
    const seminarsResult = await pool.query('SELECT * FROM seminars ORDER BY created_at DESC');
    console.log(`Found ${seminarsResult.rows.length} seminars:\n`);
    
    seminarsResult.rows.forEach((seminar, index) => {
      console.log(`${index + 1}. ${seminar.name || 'No name'}`);
      console.log(`   Contact ID: ${seminar.contact_record_id || 'N/A'}`);
      console.log(`   Instagram: ${seminar.instagram || 'N/A'}`);
      console.log(`   Manager: ${seminar.manager_responsible || 'N/A'}`);
      console.log(`   Stage: ${seminar.stage || 'N/A'}`);
      console.log(`   City: ${seminar.seminar_city || 'N/A'}`);
      console.log(`   Deal Date: ${seminar.deal_made_date || 'N/A'}`);
      console.log(`   Created: ${seminar.created_at || 'N/A'}`);
      console.log(`   Record ID: ${seminar.record_id}`);
      console.log('');
    });

    // Check course_deals
    console.log('\n📚 COURSE DEALS:');
    console.log('===============');
    const courseDealsResult = await pool.query('SELECT * FROM course_deals ORDER BY created_at DESC');
    console.log(`Found ${courseDealsResult.rows.length} course deals:\n`);
    
    if (courseDealsResult.rows.length === 0) {
      console.log('No course deals found in the database.');
    } else {
      courseDealsResult.rows.forEach((deal, index) => {
        console.log(`${index + 1}. ${deal.name || 'No name'}`);
        console.log(`   Record ID: ${deal.record_id}`);
        console.log(`   Created: ${deal.created_at || 'N/A'}`);
        console.log('');
      });
    }

    // Print first 3 course_deals
    console.log('\n📦 COURSE DEALS (first 3):');
    const dealsResult = await pool.query('SELECT * FROM course_deals ORDER BY created_at DESC LIMIT 3');
    console.dir(dealsResult.rows, { depth: null });

    // Check webinars
    console.log('\n🎥 WEBINARS:');
    console.log('============');
    const webinarsResult = await pool.query('SELECT * FROM webinars ORDER BY created_at DESC');
    console.log(`Found ${webinarsResult.rows.length} webinars:\n`);
    
    if (webinarsResult.rows.length === 0) {
      console.log('No webinars found in the database.');
    } else {
      webinarsResult.rows.forEach((webinar, index) => {
        console.log(`${index + 1}. ${webinar.name || 'No name'}`);
        console.log(`   Record ID: ${webinar.record_id}`);
        console.log(`   Created: ${webinar.created_at || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await pool.end();
  }
};

checkData().then(() => process.exit()); 