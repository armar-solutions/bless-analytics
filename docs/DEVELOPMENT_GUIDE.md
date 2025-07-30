# Development Guide

This guide provides comprehensive information for developers working on the Influencer Analytics Dashboard project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Database Development](#database-development)
7. [API Development](#api-development)
8. [Frontend Development](#frontend-development)
9. [Debugging](#debugging)
10. [Performance Optimization](#performance-optimization)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git
- VS Code (recommended) or your preferred editor
- Postman or similar API testing tool

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/InfluencerAnalytics.git
   cd InfluencerAnalytics
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Set up database:**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:sync
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Project Structure

### Backend Structure

```
backend/
├── routes/              # API route handlers
│   ├── api.js          # Main API routes
│   └── auth.js         # Authentication routes
├── services/           # Business logic
│   └── nethunt.js      # NetHunt CRM integration
├── middleware/         # Express middleware
├── db/                 # Database utilities
│   ├── migrate.js      # Migration runner
│   └── reset.js        # Database reset
├── migrations/         # Database schema files
├── server.js           # Main server file
├── index.js            # Application entry point
└── sync.js             # Data synchronization
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── common/     # Shared components
│   │   ├── charts/     # Chart components
│   │   └── forms/      # Form components
│   ├── pages/          # Page components
│   │   ├── Dashboard/
│   │   ├── Analytics/
│   │   └── Auth/
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── assets/         # Static assets
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Public assets
└── dist/               # Build output
```

## Development Workflow

### Git Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add new analytics endpoint"
   ```

3. **Push and create pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add manager performance endpoint
fix(auth): resolve JWT token validation issue
docs(readme): update installation instructions
```

### Development Environment

1. **Backend Development:**
   ```bash
   cd backend
   npm run dev  # Starts with nodemon for auto-reload
   ```

2. **Frontend Development:**
   ```bash
   cd frontend
   npm run dev  # Starts Vite dev server
   ```

3. **Database Development:**
   ```bash
   cd backend
   npm run db:migrate  # Run migrations
   npm run db:sync     # Sync with NetHunt
   ```

## Coding Standards

### JavaScript/Node.js

1. **Use ES6+ features:**
   ```javascript
   // Good
   const { destructuring } = object;
   const arrowFunction = () => {};
   const asyncFunction = async () => {};
   
   // Avoid
   var oldStyle = function() {};
   ```

2. **Error handling:**
   ```javascript
   try {
     const result = await someAsyncOperation();
     return result;
   } catch (error) {
     console.error('Operation failed:', error);
     throw new Error('Custom error message');
   }
   ```

3. **Async/await over callbacks:**
   ```javascript
   // Good
   const getData = async () => {
     const response = await fetch('/api/data');
     return response.json();
   };
   
   // Avoid
   const getData = (callback) => {
     fetch('/api/data')
       .then(response => response.json())
       .then(callback);
   };
   ```

### React

1. **Functional components with hooks:**
   ```javascript
   import React, { useState, useEffect } from 'react';
   
   const MyComponent = ({ prop1, prop2 }) => {
     const [state, setState] = useState(null);
     
     useEffect(() => {
       // Side effects
     }, [prop1]);
     
     return <div>{state}</div>;
   };
   ```

2. **Custom hooks for reusable logic:**
   ```javascript
   const useApiData = (endpoint) => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       fetchData();
     }, [endpoint]);
     
     return { data, loading, error };
   };
   ```

3. **Prop validation:**
   ```javascript
   import PropTypes from 'prop-types';
   
   MyComponent.propTypes = {
     prop1: PropTypes.string.isRequired,
     prop2: PropTypes.number
   };
   ```

### Database

1. **Use parameterized queries:**
   ```javascript
   // Good
   const query = 'SELECT * FROM users WHERE id = $1';
   const result = await client.query(query, [userId]);
   
   // Avoid
   const query = `SELECT * FROM users WHERE id = ${userId}`;
   ```

2. **Transaction handling:**
   ```javascript
   const client = await pool.connect();
   try {
     await client.query('BEGIN');
     // Multiple operations
     await client.query('COMMIT');
   } catch (error) {
     await client.query('ROLLBACK');
     throw error;
   } finally {
     client.release();
   }
   ```

## Testing

### Backend Testing

1. **Unit tests:**
   ```javascript
   // test/utils.test.js
   const { expect } = require('chai');
   const { formatCurrency } = require('../utils');
   
   describe('Utils', () => {
     it('should format currency correctly', () => {
       expect(formatCurrency(1000)).to.equal('$1,000.00');
     });
   });
   ```

2. **API tests:**
   ```javascript
   // test/api.test.js
   const request = require('supertest');
   const app = require('../server');
   
   describe('API Endpoints', () => {
     it('should return 200 for valid request', async () => {
       const response = await request(app)
         .get('/api/analytics/advertising')
         .set('Authorization', `Bearer ${token}`);
       
       expect(response.status).to.equal(200);
     });
   });
   ```

3. **Database tests:**
   ```javascript
   // test/database.test.js
   const { expect } = require('chai');
   const { query } = require('../db');
   
   describe('Database', () => {
     it('should connect successfully', async () => {
       const result = await query('SELECT NOW()');
       expect(result.rows).to.have.length(1);
     });
   });
   ```

### Frontend Testing

1. **Component tests:**
   ```javascript
   // src/components/__tests__/Chart.test.jsx
   import { render, screen } from '@testing-library/react';
   import Chart from '../Chart';
   
   test('renders chart with data', () => {
     const data = [{ name: 'Test', value: 100 }];
     render(<Chart data={data} />);
     expect(screen.getByText('Test')).toBeInTheDocument();
   });
   ```

2. **Hook tests:**
   ```javascript
   // src/hooks/__tests__/useApiData.test.js
   import { renderHook } from '@testing-library/react-hooks';
   import useApiData from '../useApiData';
   
   test('should fetch data', async () => {
     const { result } = renderHook(() => useApiData('/api/test'));
     expect(result.current.loading).toBe(true);
   });
   ```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Coverage
npm run test:coverage
```

## Database Development

### Creating Migrations

1. **Create migration file:**
   ```bash
   cd backend/migrations
   touch 001_create_users_table.sql
   ```

2. **Write migration:**
   ```sql
   -- 001_create_users_table.sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     role VARCHAR(50) DEFAULT 'manager',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_role ON users(role);
   ```

3. **Run migration:**
   ```bash
   cd backend
   npm run db:migrate
   ```

### Database Schema Design

1. **Naming conventions:**
   - Tables: plural, snake_case (`users`, `deal_stages`)
   - Columns: snake_case (`created_at`, `user_id`)
   - Indexes: `idx_tablename_columnname`

2. **Relationships:**
   ```sql
   -- Foreign key constraints
   ALTER TABLE deals ADD CONSTRAINT fk_deals_user_id 
     FOREIGN KEY (user_id) REFERENCES users(id);
   
   -- Many-to-many relationships
   CREATE TABLE user_roles (
     user_id INTEGER REFERENCES users(id),
     role_id INTEGER REFERENCES roles(id),
     PRIMARY KEY (user_id, role_id)
   );
   ```

## API Development

### Creating New Endpoints

1. **Add route to api.js:**
   ```javascript
   // routes/api.js
   router.get('/analytics/new-metric', authenticateToken, async (req, res) => {
     try {
       const { startDate, endDate } = req.query;
       const data = await getNewMetricData(startDate, endDate);
       
       res.json({
         success: true,
         data
       });
     } catch (error) {
       console.error('Error fetching new metric:', error);
       res.status(500).json({
         success: false,
         error: 'Internal server error'
       });
     }
   });
   ```

2. **Create service function:**
   ```javascript
   // services/analytics.js
   const getNewMetricData = async (startDate, endDate) => {
     const query = `
       SELECT 
         DATE(created_at) as date,
         COUNT(*) as count,
         SUM(amount) as total_amount
       FROM deals
       WHERE created_at BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY date
     `;
     
     const result = await query(query, [startDate, endDate]);
     return result.rows;
   };
   ```

### API Response Format

```javascript
// Success response
{
  "success": true,
  "data": {
    // Your data here
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}

// Error response
{
  "success": false,
  "error": "Error message",
  "details": {
    "field": "email",
    "message": "Email is required"
  }
}
```

## Frontend Development

### Component Development

1. **Create component structure:**
   ```javascript
   // src/components/analytics/MetricCard.jsx
   import React from 'react';
   import PropTypes from 'prop-types';
   import './MetricCard.css';
   
   const MetricCard = ({ title, value, change, trend }) => {
     return (
       <div className="metric-card">
         <h3 className="metric-title">{title}</h3>
         <div className="metric-value">{value}</div>
         <div className={`metric-change ${trend}`}>
           {change}%
         </div>
       </div>
     );
   };
   
   MetricCard.propTypes = {
     title: PropTypes.string.isRequired,
     value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
     change: PropTypes.number,
     trend: PropTypes.oneOf(['up', 'down', 'neutral'])
   };
   
   export default MetricCard;
   ```

2. **Styling with Tailwind:**
   ```javascript
   const MetricCard = ({ title, value, change, trend }) => {
     return (
       <div className="bg-white rounded-lg shadow-md p-6">
         <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
         <div className="text-3xl font-bold text-gray-900">{value}</div>
         <div className={`text-sm mt-2 ${
           trend === 'up' ? 'text-green-600' : 
           trend === 'down' ? 'text-red-600' : 'text-gray-600'
         }`}>
           {change}%
         </div>
       </div>
     );
   };
   ```

### State Management

1. **Context API for global state:**
   ```javascript
   // src/contexts/AuthContext.jsx
   import React, { createContext, useContext, useReducer } from 'react';
   
   const AuthContext = createContext();
   
   const authReducer = (state, action) => {
     switch (action.type) {
       case 'LOGIN':
         return { ...state, user: action.payload, isAuthenticated: true };
       case 'LOGOUT':
         return { ...state, user: null, isAuthenticated: false };
       default:
         return state;
     }
   };
   
   export const AuthProvider = ({ children }) => {
     const [state, dispatch] = useReducer(authReducer, {
       user: null,
       isAuthenticated: false
     });
     
     return (
       <AuthContext.Provider value={{ state, dispatch }}>
         {children}
       </AuthContext.Provider>
     );
   };
   
   export const useAuth = () => useContext(AuthContext);
   ```

2. **Custom hooks for API calls:**
   ```javascript
   // src/hooks/useApi.js
   import { useState, useEffect } from 'react';
   
   export const useApi = (endpoint, options = {}) => {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     useEffect(() => {
       const fetchData = async () => {
         try {
           setLoading(true);
           const response = await fetch(endpoint, {
             headers: {
               'Authorization': `Bearer ${localStorage.getItem('token')}`,
               'Content-Type': 'application/json'
             },
             ...options
           });
           
           if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
           }
           
           const result = await response.json();
           setData(result.data);
         } catch (err) {
           setError(err.message);
         } finally {
           setLoading(false);
         }
       };
       
       fetchData();
     }, [endpoint]);
     
     return { data, loading, error };
   };
   ```

## Debugging

### Backend Debugging

1. **Enable debug logging:**
   ```javascript
   // Add to server.js
   const debug = require('debug')('app:server');
   
   app.use((req, res, next) => {
     debug(`${req.method} ${req.url}`);
     next();
   });
   ```

2. **Database debugging:**
   ```javascript
   // Enable query logging
   const { Pool } = require('pg');
   
   const pool = new Pool({
     // ... config
     log: (msg) => console.log(msg)
   });
   ```

3. **Error tracking:**
   ```javascript
   process.on('uncaughtException', (error) => {
     console.error('Uncaught Exception:', error);
     process.exit(1);
   });
   
   process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
   });
   ```

### Frontend Debugging

1. **React DevTools:**
   - Install React Developer Tools browser extension
   - Use Components and Profiler tabs

2. **Console debugging:**
   ```javascript
   // Add to components
   console.log('Component props:', props);
   console.log('Component state:', state);
   ```

3. **Network debugging:**
   ```javascript
   // Intercept API calls
   const originalFetch = window.fetch;
   window.fetch = function(...args) {
     console.log('Fetch request:', args);
     return originalFetch.apply(this, args).then(response => {
       console.log('Fetch response:', response);
       return response;
     });
   };
   ```

## Performance Optimization

### Backend Optimization

1. **Database optimization:**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX CONCURRENTLY idx_deals_created_at ON deals(created_at);
   CREATE INDEX CONCURRENTLY idx_deals_status ON deals(status);
   
   -- Use EXPLAIN ANALYZE to optimize queries
   EXPLAIN ANALYZE SELECT * FROM deals WHERE status = 'closed';
   ```

2. **Caching:**
   ```javascript
   const NodeCache = require('node-cache');
   const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes
   
   const getCachedData = async (key, fetchFunction) => {
     let data = cache.get(key);
     if (data === undefined) {
       data = await fetchFunction();
       cache.set(key, data);
     }
     return data;
   };
   ```

3. **Connection pooling:**
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   ```

### Frontend Optimization

1. **Code splitting:**
   ```javascript
   // Lazy load components
   const Dashboard = React.lazy(() => import('./pages/Dashboard'));
   const Analytics = React.lazy(() => import('./pages/Analytics'));
   
   // Use Suspense
   <Suspense fallback={<Loading />}>
     <Dashboard />
   </Suspense>
   ```

2. **Memoization:**
   ```javascript
   import React, { useMemo, useCallback } from 'react';
   
   const ExpensiveComponent = ({ data }) => {
     const processedData = useMemo(() => {
       return data.map(item => expensiveOperation(item));
     }, [data]);
     
     const handleClick = useCallback(() => {
       // Handle click
     }, []);
     
     return <div onClick={handleClick}>{processedData}</div>;
   };
   ```

3. **Bundle optimization:**
   ```javascript
   // vite.config.js
   export default {
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
             charts: ['recharts']
           }
         }
       }
     }
   };
   ```

---

**Last Updated:** December 2024  
**Version:** 1.0.0 