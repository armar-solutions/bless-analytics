# API Documentation

## Overview

The Influencer Analytics API provides endpoints for authentication, data retrieval, and analytics. The API is RESTful and uses JSON for data exchange.

**Base URL:** `http://localhost:3001/api` (development)  
**Production URL:** `https://your-domain.com/api`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/register

Register a new user (Admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "role": "manager",
    "name": "New User"
  }
}
```

#### GET /api/auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "name": "John Doe"
  }
}
```

### Analytics

#### GET /api/analytics/advertising

Get advertising analytics data.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `campaign` (optional): Filter by campaign name

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpent": 15000.50,
    "totalClicks": 2500,
    "totalConversions": 150,
    "roi": 2.5,
    "campaigns": [
      {
        "name": "Facebook Campaign",
        "spent": 8000.25,
        "clicks": 1200,
        "conversions": 80,
        "roi": 2.8
      }
    ],
    "dailyData": [
      {
        "date": "2024-01-01",
        "spent": 500.00,
        "clicks": 80,
        "conversions": 5
      }
    ]
  }
}
```

#### GET /api/analytics/sales-funnels

Get sales funnel analytics.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `funnelType` (optional): Type of funnel to analyze

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "funnelStages": [
      {
        "stage": "Leads",
        "count": 1000,
        "conversionRate": 100
      },
      {
        "stage": "Qualified",
        "count": 300,
        "conversionRate": 30
      },
      {
        "stage": "Proposals",
        "count": 150,
        "conversionRate": 15
      },
      {
        "stage": "Closed",
        "count": 75,
        "conversionRate": 7.5
      }
    ],
    "totalRevenue": 75000.00,
    "averageDealSize": 1000.00
  }
}
```

#### GET /api/analytics/segmentation

Get client segmentation data.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `segmentBy` (optional): Segmentation criteria (age, location, etc.)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "segments": [
      {
        "name": "Students (18-25)",
        "count": 500,
        "revenue": 25000.00,
        "percentage": 33.3
      },
      {
        "name": "Professionals (26-35)",
        "count": 300,
        "revenue": 30000.00,
        "percentage": 20.0
      }
    ],
    "totalClients": 1500,
    "totalRevenue": 75000.00
  }
}
```

#### GET /api/analytics/manager-performance

Get manager performance metrics.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `managerId` (optional): Specific manager ID

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "managers": [
      {
        "id": 1,
        "name": "John Manager",
        "leadsGenerated": 150,
        "dealsClosed": 25,
        "revenue": 25000.00,
        "conversionRate": 16.7,
        "averageDealSize": 1000.00
      }
    ],
    "totalRevenue": 75000.00,
    "averageConversionRate": 15.2
  }
}
```

### Data Synchronization

#### POST /api/sync/trigger

Trigger manual data synchronization with NetHunt CRM.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Data sync initiated",
  "syncId": "sync_123456789"
}
```

#### GET /api/sync/status

Get the status of data synchronization.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lastSync": "2024-01-01T10:00:00Z",
    "status": "completed",
    "recordsProcessed": 1500,
    "errors": 0,
    "nextSync": "2024-01-01T11:00:00Z"
  }
}
```

### User Management (Admin Only)

#### GET /api/users

Get all users (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### PUT /api/users/:id

Update user information (Admin only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "manager"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Updated Name",
    "role": "manager"
  }
}
```

#### DELETE /api/users/:id

Delete a user (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "email",
    "message": "Email is required"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per user

## Data Formats

### Dates
All dates are returned in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

### Numbers
- Currency values are returned as numbers with 2 decimal places
- Percentages are returned as numbers (e.g., 15.5 for 15.5%)
- IDs are returned as integers

### Pagination
For endpoints that support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Testing

You can test the API endpoints using the provided test scripts:

```bash
# Test all API endpoints
cd backend
node test-api-endpoints.js

# Test NetHunt integration
node test-nethunt.js

# Test data integrity
node check-data.js
```

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get advertising analytics
const getAdvertisingData = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/advertising', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response.data);
  }
};
```

### Python
```python
import requests

class InfluencerAnalyticsAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def get_advertising_data(self, start_date=None, end_date=None):
        params = {}
        if start_date:
            params['startDate'] = start_date
        if end_date:
            params['endDate'] = end_date
        
        response = requests.get(
            f'{self.base_url}/analytics/advertising',
            headers=self.headers,
            params=params
        )
        return response.json()
```

## Webhooks

The API supports webhooks for real-time notifications:

### Configure Webhook
```json
POST /api/webhooks/configure
{
  "url": "https://your-app.com/webhook",
  "events": ["data_sync_completed", "new_deal"]
}
```

### Webhook Payload
```json
{
  "event": "data_sync_completed",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": {
    "recordsProcessed": 1500,
    "errors": 0
  }
}
```

---

**Last Updated:** December 2024  
**API Version:** 1.0.0 