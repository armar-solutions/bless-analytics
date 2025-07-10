const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

// Create a new pool with explicit configuration
const pool = new Pool({
  user: 'analytics_user',
  host: 'localhost',
  database: 'influencer_analytics',
  password: 'hog4MrofE.rK97@9',
  port: 5432,
});

const paidStatuses = ['Передплата отримана', 'Оплачено', 'Сплачено', 'Предоплата проведена', 'Кваліфікований'];
const completedStatuses = ['Курс пройдено', 'Семінар пройдено', 'Подивився вебінар', 'Кваліфікований'];

const getMNPStatuses = async () => {
  try {
    // Print total number of records
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM course_deals');
    console.log(`Total records in course_deals: ${totalResult.rows[0].total}`);

    // Count deals for each category
    const signedUpResult = await pool.query(`SELECT COUNT(*) FROM course_deals WHERE stage IS NOT NULL AND stage != '' AND stage != 'Втрачено'`);
    const paidResult = await pool.query(`SELECT COUNT(*) FROM course_deals WHERE stage = ANY($1) OR stage = ANY($2)`, [paidStatuses, completedStatuses]);
    const completedResult = await pool.query(`SELECT COUNT(*) FROM course_deals WHERE stage = ANY($1)`, [completedStatuses]);
    const lostResult = await pool.query(`SELECT COUNT(*) FROM course_deals WHERE stage = 'Втрачено'`);

    console.log(`\nSigned Up (not lost): ${signedUpResult.rows[0].count}`);
    console.log(`Paid (stage in paid OR completed): ${paidResult.rows[0].count}`);
    console.log(`Completed (stage in completed): ${completedResult.rows[0].count}`);
    console.log(`Lost (stage is 'Втрачено'): ${lostResult.rows[0].count}`);

    console.log('=== MNP Database People Statuses ===\n');
    
    // Get all unique stages in the course_deals table
    const stagesResult = await pool.query(`
      SELECT DISTINCT stage, COUNT(*) as count
      FROM course_deals 
      WHERE stage IS NOT NULL AND stage != ''
      GROUP BY stage 
      ORDER BY count DESC
    `);
    
    console.log('📊 All Statuses in MNP Database:');
    console.log('================================');
    stagesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.stage} - ${row.count} people`);
    });
    
    console.log('\n📈 Status Breakdown:');
    console.log('===================');
    
    // Get detailed breakdown with people info
    const detailedResult = await pool.query(`
      SELECT 
        stage,
        name,
        phone,
        email,
        contact_record_id,
        created_at,
        course_city,
        manager_responsible
      FROM course_deals 
      WHERE stage IS NOT NULL AND stage != ''
      ORDER BY stage, created_at DESC
    `);
    
    // Group by stage
    const groupedByStage = {};
    detailedResult.rows.forEach(row => {
      if (!groupedByStage[row.stage]) {
        groupedByStage[row.stage] = [];
      }
      groupedByStage[row.stage].push(row);
    });
    
    Object.keys(groupedByStage).forEach(stage => {
      console.log(`\n🎯 ${stage} (${groupedByStage[stage].length} people):`);
      console.log('-'.repeat(50));
      
      groupedByStage[stage].slice(0, 10).forEach((person, index) => {
        console.log(`${index + 1}. ${person.name || 'No name'}`);
        console.log(`   Phone: ${person.phone || 'N/A'}`);
        console.log(`   Email: ${person.email || 'N/A'}`);
        console.log(`   City: ${person.course_city || 'N/A'}`);
        console.log(`   Manager: ${person.manager_responsible || 'N/A'}`);
        console.log(`   Created: ${person.created_at || 'N/A'}`);
        console.log(`   Contact ID: ${person.contact_record_id || 'N/A'}`);
        console.log('');
      });
      
      if (groupedByStage[stage].length > 10) {
        console.log(`... and ${groupedByStage[stage].length - 10} more people`);
      }
    });
    
    // Get summary statistics
    console.log('\n📊 Summary Statistics:');
    console.log('=====================');
    
    const summaryResult = await pool.query(`
      SELECT 
        COUNT(*) as total_people,
        COUNT(DISTINCT stage) as unique_stages,
        COUNT(DISTINCT contact_record_id) as unique_contacts,
        COUNT(DISTINCT course_city) as unique_cities,
        COUNT(DISTINCT manager_responsible) as unique_managers,
        MIN(created_at) as earliest_record,
        MAX(created_at) as latest_record
      FROM course_deals 
      WHERE stage IS NOT NULL AND stage != ''
    `);
    
    const summary = summaryResult.rows[0];
    console.log(`Total people with statuses: ${summary.total_people}`);
    console.log(`Unique stages: ${summary.unique_stages}`);
    console.log(`Unique contacts: ${summary.unique_contacts}`);
    console.log(`Unique cities: ${summary.unique_cities}`);
    console.log(`Unique managers: ${summary.unique_managers}`);
    console.log(`Date range: ${summary.earliest_record} to ${summary.latest_record}`);
    
  } catch (error) {
    console.error('Error fetching MNP statuses:', error);
  } finally {
    await pool.end();
  }
};

getMNPStatuses(); 