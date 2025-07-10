#!/bin/bash

# Database Setup Script for Influencer Analytics
# Run this after server setup

set -e

echo "🗄️ Setting up database for Influencer Analytics..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Database configuration
DB_NAME="influencer_analytics"
DB_USER="analytics_user"
DB_PASSWORD=""

# Get database password
read -s -p "Enter database password for $DB_USER: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    print_error "Database password is required"
    exit 1
fi

print_status "Creating database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

print_status "Running database migrations..."
cd /var/www/influencer-analytics/backend

# Run migrations in order
print_status "Running migration 001_create_users_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/001_create_users_table.sql

print_status "Running migration 002_create_contacts_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/002_create_contacts_table.sql

print_status "Running migration 003_create_course_deals_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/003_create_course_deals_table.sql

print_status "Running migration 004_create_webinars_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/004_create_webinars_table.sql

print_status "Running migration 005_create_seminars_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/005_create_seminars_table.sql

print_status "Running migration 006_create_deal_stage_history_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/006_create_deal_stage_history_table.sql

print_status "Running migration 004_add_user_management_columns.sql..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/004_add_user_management_columns.sql

print_status "Database setup completed! 🎉"
echo ""
echo "Database configuration:"
echo "- Database: $DB_NAME"
echo "- User: $DB_USER"
echo "- Password: [hidden]"
echo ""
echo "Next steps:"
echo "1. Create .env file with database credentials"
echo "2. Run the deployment script: ./deploy.sh" 