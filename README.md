# Influencer Analytics Dashboard

A comprehensive web-based analytics dashboard that connects to NetHunt CRM to provide insights into sales, marketing, and performance metrics.

## 🎯 Project Overview

The Influencer Analytics Dashboard is a full-stack web application designed to fetch, process, and visualize data from NetHunt CRM. It provides interactive dashboards for advertising analytics, sales funnels, student/client segmentation, and manager performance tracking.

## ✨ Core Features

- **Multi-Page Dashboard:** Separate analytics pages for different business areas
- **Interactive Visualizations:** Charts, graphs, and data tables using Recharts
- **User Role Management:** Admin and Manager roles with different access levels
- **Data Export:** Download reports in PDF and Excel formats
- **Internationalization:** Support for English and Russian languages
- **Real-time Data Sync:** Automated data synchronization with NetHunt CRM
- **Date Filtering:** Global date-range selector for dynamic data filtering

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT with bcryptjs
- **API Integration:** NetHunt CRM API
- **Process Management:** PM2

### Frontend
- **Framework:** React 19 with Vite
- **Styling:** Tailwind CSS + Bootstrap
- **Charts:** Recharts
- **Routing:** React Router DOM
- **Icons:** React Bootstrap Icons

### DevOps
- **Deployment:** AWS EC2
- **Process Management:** PM2
- **Database:** PostgreSQL on AWS RDS
- **Reverse Proxy:** Nginx

## 📁 Project Structure

```
InfluencerAnalytics/
├── backend/                 # Node.js/Express backend
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── middleware/         # Express middleware
│   ├── db/                 # Database migrations and setup
│   ├── migrations/         # Database schema migrations
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── assets/         # Static assets
│   └── public/             # Public assets
├── scripts/                # Deployment and setup scripts
└── docs/                   # Documentation files
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- NetHunt CRM account with API access

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InfluencerAnalytics
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database and NetHunt credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Database Setup**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:sync
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001

# PostgreSQL Database
DB_USER=your_db_user
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# NetHunt CRM API
NETHUNT_API_KEY=your_api_key
NETHUNT_EMAIL=your_email

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here
```

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Analytics Endpoints

- `GET /api/analytics/advertising` - Advertising metrics
- `GET /api/analytics/sales-funnels` - Sales funnel data
- `GET /api/analytics/segmentation` - Client segmentation
- `GET /api/analytics/manager-performance` - Manager performance

### Data Sync Endpoints

- `POST /api/sync/trigger` - Trigger manual data sync
- `GET /api/sync/status` - Get sync status

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server
npm start           # Start production server
npm run db:migrate  # Run database migrations
npm run db:sync     # Sync data with NetHunt
npm run db:reset    # Reset and migrate database
npm run check-data  # Check data integrity
```

### Frontend Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🚀 Deployment

### AWS Deployment

The project includes comprehensive AWS deployment scripts:

1. **Initial Setup**
   ```bash
   ./aws-setup.sh
   ```

2. **Database Setup**
   ```bash
   ./aws-setup-database.sh
   ```

3. **Deploy Updates**
   ```bash
   ./deploy-update.sh
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   cd frontend && npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   ```

## 📈 Data Flow

1. **Data Collection:** Automated sync with NetHunt CRM API
2. **Data Processing:** Transform and aggregate raw data
3. **Data Storage:** Store in PostgreSQL database
4. **Data Visualization:** Serve processed data to frontend
5. **User Interface:** Display interactive charts and tables

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Environment variable protection
- CORS configuration

## 🧪 Testing

```bash
# Test API endpoints
cd backend
node test-api-endpoints.js

# Test NetHunt integration
node test-nethunt.js

# Test data integrity
node check-data.js
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review deployment guides in the root directory
- Contact the development team

## 📊 Performance Monitoring

- Application logs: `pm2 logs`
- Database monitoring: PostgreSQL logs
- Server monitoring: AWS CloudWatch
- Error tracking: PM2 error logs

---

**Last Updated:** July 2025  
**Version:** 1.0.0 
