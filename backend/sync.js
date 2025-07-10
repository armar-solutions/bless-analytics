const pool = require('./db/pool');
const { getRecordsFromFolder, getRecordTimeline } = require('./services/nethunt');

// --- Configuration: Folder IDs from NetHunt ---
// These were retrieved by running the test-nethunt.js script.
const FOLDER_IDS = {
  contacts: '660fc5dc59239c5c0f7c837b',
  course_deals: '660fc5dc59239c5c0f7c837a',
  webinars: '660fc82c00325e3d12dcb244',
  seminars: '660fc834585b5c584a7d4add',
};

// --- Helper function to map API field names to database column names ---
// This is necessary because API field names have spaces and different cases.
const fieldToColumn = (fieldName) => {
  if (!fieldName) return null;
  const name = fieldName.toLowerCase();
  
  // Mappings for fields that don't convert automatically
  const specialMappings = {
    // Contacts & Seminars common fields
    "ім'я": 'name', // Also "Name" in Seminars
    'телефон': 'phone_number',
    'відповідальний менеджер': 'manager_responsible',
    'відділ продажів': 'sales_department',
    'керівник відділу': 'leader_of_sales_department',
    'створено': 'created_how',
    'всього листів': 'number_of_emails',
    'всього дзвінків': 'number_of_phone_calls',
    'всього подій у календарі': 'number_of_calendar_events',
    'всього файлів': 'number_of_files',
    'дата створення': 'created_at',
    'контакт': 'contact_record_id',
    'етап': 'stage',
    'email адреса': 'email',

    // Contacts specific
    'країна': 'country',
    'статус контакту': 'contact_status',

    // Seminars specific
    'тип url': 'url_type',
    
    // Generic fallbacks from original spec
    'reason why the client was lost': 'lost_reason',
    'lost because': 'lost_reason',
    'did he leave the request': 'left_request',
    'did he watch the webinar': 'watched_webinar',
    'cost of the seminar': 'seminar_cost',
    'date of the seminar': 'seminar_date',
    'type of the seminar': 'seminar_type',
    'city of the seminar': 'seminar_city',
    'date the deal was made': 'deal_made_date',
    'contacts': 'contact_record_id',
    'phone': 'phone_number',
    'вартість курсу': 'course_price',
  };

  if (specialMappings[name]) {
    return specialMappings[name];
  }
  
  return name.replace(/ /g, '_');
};

const getTableColumns = async (tableName) => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1;
        `, [tableName]);
        return res.rows.map(row => row.column_name);
    } finally {
        client.release();
    }
};

// Global sync status tracking
global.syncInProgress = false;
global.lastSyncTime = null;

/**
 * Main function to run the entire sync process for all folders with results tracking and logging to sync_history.
 */
const runSyncWithResults = async () => {
  if (global.syncInProgress) {
    throw new Error('Sync already in progress');
  }
  global.syncInProgress = true;
  const startTime = new Date();
  let syncHistoryId = null;

  // Insert initial sync_history row
  try {
    const insertRes = await pool.query(
      `INSERT INTO sync_history (triggered_by, started_at, status) VALUES ($1, $2, $3) RETURNING id`,
      ['admin', startTime, 'running']
    );
    syncHistoryId = insertRes.rows[0].id;
  } catch (err) {
    console.error('Failed to log sync start:', err);
  }

  const results = {
    startTime: startTime,
    endTime: null,
    duration: null,
    success: false,
    errors: [],
    summary: {
      contacts: { count: 0, errors: 0 },
      course_deals: { count: 0, errors: 0 },
      webinars: { count: 0, errors: 0 },
      seminars: { count: 0, errors: 0 }
    }
  };
  
  try {
    console.log('Starting full data synchronization from NetHunt CRM...');
    
    // Sync each folder and capture results
    const contactsResult = await syncFolderToTableWithResults(FOLDER_IDS.contacts, 'contacts');
    const courseDealsResult = await syncFolderToTableWithResults(FOLDER_IDS.course_deals, 'course_deals', 'course');
    const webinarsResult = await syncFolderToTableWithResults(FOLDER_IDS.webinars, 'webinars', 'webinar');
    const seminarsResult = await syncFolderToTableWithResults(FOLDER_IDS.seminars, 'seminars', 'seminar');
    
    // Update results
    results.summary.contacts = contactsResult;
    results.summary.course_deals = courseDealsResult;
    results.summary.webinars = webinarsResult;
    results.summary.seminars = seminarsResult;
    
    results.success = true;
    console.log('\n--- Full data synchronization complete! ---');
  } catch (error) {
    console.error('\n--- A critical error occurred during the sync process. ---', error);
    results.errors.push(error.message);
    results.success = false;
  } finally {
    const endTime = new Date();
    results.endTime = endTime;
    results.duration = endTime - startTime;
    
    global.syncInProgress = false;
    global.lastSyncTime = endTime;
    
    // Update sync_history row
    if (syncHistoryId) {
      try {
        await pool.query(
          `UPDATE sync_history SET finished_at = $1, status = $2, summary = $3, error = $4 WHERE id = $5`,
          [endTime, results.success ? 'success' : 'error', results.summary, results.errors.length ? results.errors.join('; ') : null, syncHistoryId]
        );
      } catch (err) {
        console.error('Failed to log sync completion:', err);
      }
    }
    // Do not close pool here; keep alive for server
  }
  
  return results;
};

/**
 * Syncs records from a specific NetHunt folder to a specified table with result tracking.
 */
const syncFolderToTableWithResults = async (folderId, tableName, dealType = null) => {
  console.log(`\n--- Starting sync for ${tableName} (Folder ID: ${folderId}) ---`);
  
  const result = {
    count: 0,
    errors: 0,
    timelineErrors: 0
  };
  
  try {
  const records = await getRecordsFromFolder(folderId);
  if (!records || records.length === 0) {
    console.log(`No records found in folder ${folderId}. Skipping.`);
      return result;
  }
  console.log(`Found ${records.length} records in NetHunt.`);

  const tableColumns = await getTableColumns(tableName);
  const client = await pool.connect();
    
  try {
    for (const record of records) {
        try {
      const recordData = {
        record_id: record.id,
        created_at: record.createdAt || null,
      };
      for (const fieldName in record.fields) {
        const columnName = fieldToColumn(fieldName);
        if (columnName && tableColumns.includes(columnName)) {
          if (typeof record.fields[fieldName] === 'boolean') {
            recordData[columnName] = record.fields[fieldName];
          } else if (['true', 'false'].includes(String(record.fields[fieldName]).toLowerCase())) {
            recordData[columnName] = String(record.fields[fieldName]).toLowerCase() === 'true';
          } else {
            recordData[columnName] = record.fields[fieldName] || null;
          }
        }
      }
      const columns = Object.keys(recordData);
      const values = Object.values(recordData);
      const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const updateSet = columns.map(col => `${col} = EXCLUDED.${col}`).join(', ');
      const query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${valuePlaceholders})
        ON CONFLICT (record_id) 
        DO UPDATE SET ${updateSet};
      `;
      await client.query(query, values);
          result.count++;

      // --- Stage Change History Sync ---
      if (dealType) {
        try {
          const timeline = await getRecordTimeline(record.id);
          if (Array.isArray(timeline)) {
            for (const event of timeline) {
              // Only store stage change events
              if (event.type === 'stageChanged') {
                await client.query(
                  `INSERT INTO deal_stage_history 
                    (deal_record_id, contact_record_id, old_stage, new_stage, changed_at, changed_by, deal_type, extra)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                   ON CONFLICT DO NOTHING;`,
                  [
                    record.id,
                    record.fields['контакт'] || record.fields['contacts'] || record.fields['contact_record_id'] || null,
                    event.oldValue,
                    event.newValue,
                    event.createdAt || event.created_at || null,
                    event.user?.name || event.user || null,
                    dealType,
                    event
                  ]
                );
              }
            }
          }
        } catch (err) {
              result.timelineErrors++;
          if (err.response && err.response.status === 404) {
            console.warn(`Timeline 404 for record ${record.id} (${tableName}): Not found, skipping timeline.`);
          } else {
            console.error(`Error syncing stage history for record ${record.id}:`, err.message);
          }
        }
          }
        } catch (err) {
          result.errors++;
          console.error(`Error processing record ${record.id} in ${tableName}:`, err.message);
      }
    }
      console.log(`✅ Successfully synced ${result.count} records to the "${tableName}" table.`);
    if (dealType) {
        console.log(`Stage history timeline errors for ${tableName}: ${result.timelineErrors}`);
    }
  } catch (error) {
    console.error(`❌ Error syncing data to ${tableName}:`, error);
      result.errors++;
  } finally {
    client.release();
  }
  } catch (error) {
    console.error(`❌ Error in syncFolderToTableWithResults for ${tableName}:`, error);
    result.errors++;
  }
  
  return result;
};

module.exports = {
  runSyncWithResults,
  syncFolderToTableWithResults
}; 