DROP TABLE IF EXISTS seminars;
CREATE TABLE seminars (
    record_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    contact_record_id VARCHAR(255), -- Foreign key to contacts table
    instagram VARCHAR(255),
    manager_responsible VARCHAR(255),
    sales_department VARCHAR(255),
    leader_of_sales_department VARCHAR(255),
    stage VARCHAR(255),
    seminar_city VARCHAR(255),
    deal_made_date DATE,
    created_at TIMESTAMP,
    created_how VARCHAR(255),
    url_type VARCHAR(255),
    number_of_emails INTEGER,
    number_of_phone_calls INTEGER,
    number_of_calendar_events INTEGER,
    number_of_files INTEGER
); 