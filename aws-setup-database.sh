#!/bin/bash

# AWS Database Setup Script for Influencer Analytics
# Run this after AWS server setup

set -e

echo "🗄️ Setting up RDS database for Influencer Analytics..."

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
DB_USER="postgres"
DB_PASSWORD=""
RDS_ENDPOINT=""

# Get RDS endpoint
read -p "Enter your RDS endpoint (e.g., db-abc123.us-east-1.rds.amazonaws.com): " RDS_ENDPOINT

if [ -z "$RDS_ENDPOINT" ]; then
    print_error "RDS endpoint is required"
    exit 1
fi

# Get database password
read -s -p "Enter database password for $DB_USER: " DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    print_error "Database password is required"
    exit 1
fi

print_status "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d postgres -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    print_error "Cannot connect to RDS database. Please check:"
    print_error "1. RDS endpoint is correct"
    print_error "2. Database password is correct"
    print_error "3. Security group allows EC2 access"
    print_error "4. RDS instance is running"
    exit 1
fi

print_status "Creating database..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database may already exist"

print_status "Running database migrations..."
cd /var/www/influencer-analytics/backend

# Run migrations in order
print_status "Running migration 001_create_users_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/001_create_users_table.sql

print_status "Running migration 002_create_contacts_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/002_create_contacts_table.sql

print_status "Running migration 003_create_course_deals_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/003_create_course_deals_table.sql

print_status "Running migration 004_create_webinars_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/004_create_webinars_table.sql

print_status "Running migration 005_create_seminars_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/005_create_seminars_table.sql

print_status "Running migration 006_create_deal_stage_history_table.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/006_create_deal_stage_history_table.sql

print_status "Running migration 004_add_user_management_columns.sql..."
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U $DB_USER -d $DB_NAME -f migrations/004_add_user_management_columns.sql

print_status "Database setup completed! 🎉"
echo ""
echo "Database configuration:"
echo "- Endpoint: $RDS_ENDPOINT"
echo "- Database: $DB_NAME"
echo "- User: $DB_USER"
echo "- Password: [hidden]"
echo ""
echo "Next steps:"
echo "1. Update .env file with these database credentials"
echo "2. Run the deployment script: ./deploy.sh" 