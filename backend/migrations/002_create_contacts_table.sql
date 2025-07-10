DROP TABLE IF EXISTS contacts;
CREATE TABLE contacts (
    record_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    phone_number VARCHAR(255),
    country VARCHAR(255),
    manager_responsible VARCHAR(255),
    sales_department VARCHAR(255),
    contact_status VARCHAR(255),
    email VARCHAR(255),
    created_how VARCHAR(255),
    number_of_emails INTEGER,
    number_of_phone_calls INTEGER,
    number_of_calendar_events INTEGER,
    number_of_files INTEGER,
    created_at TIMESTAMP
); 