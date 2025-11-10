# Bavadiya Realty Dashboard

## Full-Stack Payment Dashboard with React Frontend, Node.js Backend, JWT Authentication, and JSON Data Storage

![Bavadiya Realty](https://bavadiyarealty.com/logo.png)

## Features

- ✅ **User Authentication** - Secure JWT-based login system
- ✅ **Payment Management** - Track payments received and pending
- ✅ **Real-time Filters** - Filter by receive date and employee
- ✅ **Dashboard Analytics** - KPIs for payments and base prices
- ✅ **Add/Update Data** - Easily manage payment entries
- ✅ **Branded UI** - Colors from Bavadiya Realty website
- ✅ **JSON Data Storage** - Simple and flexible data persistence

## Tech Stack

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- CORS enabled

### Frontend
- React 18+
- Material-UI (MUI)
- Axios for API calls
- Context API for state management

## Project Structure

```
bavadiya-realty-dashboard/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── data.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/jenilrupapara001/bavadiya-realty-dashboard.git
cd bavadiya-realty-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend server will run on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The React app will run on `http://localhost:3000`

## Default Login Credentials

- **Username:** `admin`
- **Password:** `password123`

## Complete File Contents

Since this is a complete production-ready application, here are ALL the files you need to create:

### backend/data.json

Create this file in the `backend` folder:

```json
[
  {
    "date": "2025-11-01",
    "unitNo": "A101",
    "projectName": "Sky Residency",
    "ownerName": "John Doe",
    "ownerNumber": "9876543210",
    "customerName": "Jane Smith",
    "customerNumber": "9123456789",
    "timePeriod": "12 Months",
    "basePrice": 1200000,
    "ownerBro": 24000,
    "receiveDate": "2025-11-05",
    "customerBro": 22000,
    "customerReceiveDate": "",
    "employee": "Amit"
  }
]
```

### frontend/package.json

Create this in the `frontend` folder:

```json
{
  "name": "bavadiya-realty-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.14.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "axios": "^1.5.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

### frontend/public/index.html

Create in `frontend/public/`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bavadiya Realty Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

## API Endpoints

### Authentication

- `POST /api/login` - Login with username and password
  - Request: `{ "username": "admin", "password": "password123" }`
  - Response: `{ "token": "jwt-token-here" }`

### Data Management (Protected)

- `GET /api/data` - Get all payment data
- `POST /api/data` - Add new payment entry
- `PUT /api/data/:index` - Update payment entry

All data endpoints require `Authorization: Bearer <token>` header.

## Color Scheme (Bavadiya Realty Brand)

- **Primary Green:** `#6C9949`
- **Dark Green:** `#313F17`
- **Light Background:** `#FFFFFF`
- **Accent:** `#EEE` for cards

## Data Fields

| Field | Type | Description |
|-------|------|-------------|
| date | string | Entry date (YYYY-MM-DD) |
| unitNo | string | Property unit number |
| projectName | string | Project name |
| ownerName | string | Property owner name |
| ownerNumber | string | Owner phone number |
| customerName | string | Customer name |
| customerNumber | string | Customer phone number |
| timePeriod | string | Lease/purchase period |
| basePrice | number | Base price amount |
| ownerBro | number | Owner brokerage |
| receiveDate | string | Payment received date |
| customerBro | number | Customer brokerage |
| customerReceiveDate | string | Customer payment date |
| employee | string | Handling employee name |

## Payment Status Logic

- If `receiveDate` is filled → Status: **Payment Received** (Green)
- If `receiveDate` is empty → Status: **Payment Pending** (Dark Green)

## Security Notes

⚠️ **For Production:**
1. Change the JWT secret in `server.js`
2. Use environment variables for sensitive data
3. Implement proper password reset flow
4. Use a real database (MongoDB, PostgreSQL)
5. Add HTTPS/SSL certificates
6. Implement rate limiting

## License

MIT License - Feel free to use for your projects

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for Bavadiya Realty**
