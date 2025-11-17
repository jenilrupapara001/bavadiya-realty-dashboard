# Bavadiya Realty LLP Dashboard

## Complete Real Estate Payment Management System with iOS-themed UI

![Bavadiya Realty]([https://bavadiyarealty.com/logo.png](https://crm.bavadiyarealty.com/storage/uploads/logo/1754457837_logo.png))

A comprehensive, production-ready dashboard for managing real estate payments, brokerages, projects, and employees with a beautiful iOS-inspired interface.

## ✨ Features

### 🏠 **Dashboard Overview**
- ✅ **Total Portfolio Value** - Sum of all base prices
- ✅ **Total Brokerage** - Combined owner + customer commissions
- ✅ **Owner Brokerage** - Owner commission totals
- ✅ **Customer Brokerage** - Customer commission totals
- ✅ **Payment Received** - Based on receive dates
- ✅ **Outstanding Amount** - Pending payments calculation

### 📊 **Analytics Overview (Based on Total Brokerage)**
- ✅ **Employee Performance Chart** - Bar chart showing revenue by employee
- ✅ **Payment Status Distribution** - Pie chart of received vs outstanding
- ✅ **Real-time Calculations** - All metrics update automatically

### 💰 **Payment Records Management**
- ✅ **Advanced Filtering** - Date range, employee, project, status, received by
- ✅ **CRUD Operations** - Add, edit, delete payment entries
- ✅ **Status Tracking** - Received, partial, pending with color coding
- ✅ **Export Ready** - Structured data for reporting

### 📝 **Smart Input Form**
- ✅ **Required Field Validation** - All essential fields enforced
- ✅ **Brokerage Calculations** - Percentage to amount conversion
- ✅ **Project Dropdown** - Dynamic project selection
- ✅ **Employee Assignment** - Commission tracking
- ✅ **Receive Date Tracking** - Separate dates for owner/customer

### 🏗️ **Project Management**
- ✅ **Project CRUD** - Add, edit, delete projects
- ✅ **Project Statistics** - Deal count and total value per project
- ✅ **Status Management** - Active, completed, on hold
- ✅ **Location Tracking** - Project location management

### 👥 **Employee Management**
- ✅ **Employee CRUD** - Add, edit, delete employees
- ✅ **Commission Tracking** - Performance metrics
- ✅ **Contact Information** - Phone numbers and codes

### 🔐 **Security & Authentication**
- ✅ **JWT Authentication** - Secure token-based login
- ✅ **Password Hashing** - bcryptjs encryption
- ✅ **Protected Routes** - All data endpoints secured

### 🎨 **iOS-themed UI/UX**
- ✅ **iOS Blue Theme** - #007AFF primary color
- ✅ **Rounded Corners** - 12px buttons, 16px cards
- ✅ **SF Pro Fonts** - Apple system fonts
- ✅ **Smooth Animations** - iOS-style transitions
- ✅ **Responsive Design** - Mobile-first approach

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18+** - UI library
- **Chakra UI** - Component library (iOS-themed)
- **Material-UI** - Additional components
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Context API** - State management

### Deployment
- **Vercel** - Frontend hosting
- **Vercel** - Backend serverless functions
- **MongoDB Atlas** - Cloud database
- **Docker** - Containerization

## 📁 Project Structure

```
bavadiya-realty-dashboard/
├── backend/
│   ├── server.js              # Express server with MongoDB
│   ├── employees.json         # Sample employee data
│   ├── package.json
│   ├── .env.example          # Environment variables template
│   └── Dockerfile            # Backend containerization
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main app with Chakra UI theme
│   │   ├── AuthContext.jsx   # Authentication context
│   │   ├── Login.jsx         # Login component
│   │   ├── Dashboard.jsx     # Main dashboard (1632 lines)
│   │   ├── Analytics.jsx     # Analytics charts component
│   │   ├── DataTable.jsx     # Payment records table
│   │   ├── theme.js          # Material-UI theme (legacy)
│   │   └── index.js          # App entry point
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json
│   ├── Dockerfile            # Frontend containerization
│   └── nginx.conf            # Nginx configuration
├── docker-compose.yml        # Multi-container setup
├── README.md                 # This file
└── .gitignore               # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/jenilrupapara001/bavadiya-realty-dashboard.git
cd bavadiya-realty-dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

Backend runs on `http://localhost:3002`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### 4. Access the Application

Visit `http://localhost:3000` and login with:
- **Username:** `DharmeshBavadiya`
- **Password:** `BavadiyaRealtyAdmin!2024`

## 🌐 Live Demo

**Production URL:** https://bavadiyarealty.vercel.app

## 🐳 Docker Deployment

```bash
# Build and run entire stack
docker-compose up --build -d

# Access at http://localhost
```

## 🔑 Default Login Credentials

- **Username:** `DharmeshBavadiya`
- **Password:** `BavadiyaRealtyAdmin!2024`

## 📡 API Endpoints

### Authentication
- `POST /api/login` - User authentication
  ```json
  {
    "username": "DharmeshBavadiya",
    "password": "BavadiyaRealtyAdmin!2024"
  }
  ```

### Payment Data (Protected)
- `GET /api/data` - Fetch all payment records
- `POST /api/data` - Create new payment entry
- `PUT /api/data/:id` - Update payment entry
- `DELETE /api/data/:id` - Delete payment entry

### Employee Management (Protected)
- `GET /api/employees` - Fetch all employees
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Project Management (Protected)
- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

**All protected endpoints require:** `Authorization: Bearer <jwt-token>`

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

## 📊 Data Models

### Payment Entry Schema
```javascript
{
  date: String,              // Entry date (YYYY-MM-DD)
  unitNo: String,            // Property unit number
  projectName: String,       // Project name
  ownerName: String,         // Property owner name
  ownerNumber: String,       // Owner phone number
  customerName: String,      // Customer name
  customerNumber: String,    // Customer phone number
  timePeriod: String,        // Lease/purchase period
  basePrice: Number,         // Base price amount
  ownerBro: Number,          // Owner brokerage amount
  receiveDate: String,       // Owner payment received date
  ownerReceivedBy: String,   // Who received owner payment
  customerBro: Number,       // Customer brokerage amount
  customerReceiveDate: String, // Customer payment received date
  customerReceivedBy: String,  // Who received customer payment
  employee: String,          // Handling employee code
  commission: Number         // Employee commission percentage
}
```

### Employee Schema
```javascript
{
  name: String,    // Employee full name
  code: String,    // Employee code (unique identifier)
  number: String   // Contact number
}
```

### Project Schema
```javascript
{
  name: String,        // Project name
  description: String, // Project description
  location: String,    // Project location
  status: String       // Active/Completed/On Hold
}
```

## 🎨 iOS Theme Colors

- **Primary Blue:** `#007AFF` (iOS Blue)
- **Background:** `#F2F2F7` (iOS Light Gray)
- **Card Background:** `#FFFFFF`
- **Text Primary:** `#1D1D1F`
- **Text Secondary:** `#86868B`
- **Success:** `#34C759`
- **Warning:** `#FF9500`
- **Error:** `#FF3B30`

## 💡 Business Logic

### Payment Status Calculation
- **Received:** Both `receiveDate` AND `customerReceiveDate` filled
- **Partial:** Either `receiveDate` OR `customerReceiveDate` filled
- **Pending:** Neither receive date filled

### Brokerage Calculations
- **Owner Brokerage:** Can be entered as percentage or amount
- **Customer Brokerage:** Can be entered as percentage or amount
- **Employee Commission:** Percentage of base price

### Analytics Calculations
- **Total Portfolio:** Sum of all `basePrice` values
- **Total Brokerage:** Sum of all `ownerBro` + `customerBro`
- **Payment Received:** Sum based on filled receive dates
- **Outstanding:** Total Brokerage - Payment Received

## 🚀 Deployment

### Environment Variables

Create `backend/.env` from `.env.example`:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bavadiya-realty
JWT_SECRET=your-super-secure-jwt-secret-key-here
PORT=3002
NODE_ENV=production
```

### Vercel Deployment (Current)

**Frontend:** https://bavadiyarealty.vercel.app
**Backend:** https://bavadiya-realty-backend.vercel.app

### Docker Deployment

```bash
# Full stack deployment
docker-compose up --build -d

# Access at http://localhost
```

### Manual Deployment

```bash
# Backend
cd backend
npm ci --only=production
npm start

# Frontend
cd frontend
npm run build
# Serve build/ with nginx
```

## 🔒 Security Features

- ✅ **JWT Authentication** with secure tokens
- ✅ **Password Hashing** using bcryptjs
- ✅ **CORS Protection** with allowed origins
- ✅ **Input Validation** on all forms
- ✅ **Protected Routes** for all data operations
- ✅ **MongoDB Security** with connection encryption

## 📈 Performance Optimizations

- ✅ **Lazy Loading** of components
- ✅ **Efficient Filtering** with client-side caching
- ✅ **Responsive Design** for all devices
- ✅ **Optimized Bundle** with code splitting
- ✅ **Database Indexing** for fast queries

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts:** Ensure ports 3000 and 3002 are available
2. **MongoDB Connection:** Verify connection string in `.env`
3. **Build Errors:** Run `npm install` in both directories
4. **CORS Issues:** Check `ALLOWED_ORIGINS` in environment

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📄 License

**MIT License** - Free to use for commercial and personal projects

## 📞 Support

- **GitHub Issues:** Report bugs and request features
- **Email:** For business inquiries
- **Live Demo:** https://bavadiyarealty.vercel.app

---

## 🎉 **About Bavadiya Realty LLP**

**Bavadiya Realty LLP** is a premier real estate company specializing in property development and brokerage services. This dashboard provides comprehensive management of payment tracking, employee performance, and project oversight.

**Built with ❤️ for Bavadiya Realty LLP**

**Version:** 1.0.0
**Last Updated:** November 2024
**Live Demo:** [bavadiyarealty.vercel.app](https://bavadiyarealty.vercel.app)
