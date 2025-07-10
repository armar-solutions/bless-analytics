# Analytics Dashboard for NetHunt CRM

## 1. Project Goal

The primary objective is to build a web-based analytics dashboard that connects to a client's NetHunt CRM instance. The application will fetch, process, and store sales and marketing data to display key business metrics through a series of interactive and downloadable visualizations, based on provided design mockups.

## 2. Core Features

- **Multi-Page Dashboard:** Separate analytics pages for Advertising, Sales Funnels, Student/Client Segmentation, and Manager Performance.
- **Data Visualization:** Interactive charts (line, donut, bar, funnel) and data tables to represent key metrics.
- **User Roles:**
    - **Admin:** Full access, plus user management (invite, remove, change roles) and the ability to set sales targets.
    - **Manager:** View-only access to all dashboards.
- **Reporting:** Ability to download data from any widget into PDF and Excel formats.
- **Internationalization:** The UI will support both English and Russian.
- **Date Filtering:** A global date-range selector to filter all dashboard data dynamically.

## 3. Technology Stack

- **Backend:** Node.js with Express.js
- **Frontend:** React with Vite
- **Database:** PostgreSQL
- **Charting:** Recharts
- **Styling:** Tailwind CSS

## 4. Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- npm / yarn
- PostgreSQL

### Backend Setup

```bash
cd backend
npm install
# Create a .env file and add database/CRM credentials
cp .env.example .env
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
``` 