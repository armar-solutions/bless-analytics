#!/bin/bash

# Generate secure secrets for Influencer Analytics
# Run this to generate secure random strings for your .env file

echo "🔐 Generating secure secrets for Influencer Analytics..."
echo ""

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 64)
echo "JWT_SECRET=$JWT_SECRET"
echo ""

# Generate database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "DB_PASSWORD=$DB_PASSWORD"
echo ""

echo "📝 Copy these values to your .env file:"
echo "1. Copy the JWT_SECRET value"
echo "2. Copy the DB_PASSWORD value"
echo "3. Update your database setup script with the password"
echo ""
echo "⚠️  Keep these secrets secure and don't share them!" 