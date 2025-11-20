# 🏢 Bavadiya Realty LLP Dashboard

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

**[📱 Screenshots](#-screenshots)** • **[🛠️ Tech Stack](#-tech-stack)** • **[🚀 Quick Start](#-quick-start)**

A modern, production-ready real estate payment management system with iOS-inspired design

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📊 Project Architecture](#-project-architecture)
- [🔧 Configuration](#-configuration)
- [📡 API Documentation](#-api-documentation)
- [🎨 Design System](#-design-system)
- [🔐 Security](#-security)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [📈 Performance](#-performance)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🏠 **Core Dashboard**
- **📊 Real-time Metrics**: Portfolio value, brokerage totals, payment status
- **📈 Interactive Analytics**: Employee performance charts, payment distribution
- **💰 Payment Management**: Advanced filtering, CRUD operations, status tracking
- **🏗️ Project Management**: Complete project lifecycle management
- **👥 Employee Management**: Performance tracking, commission calculations
- **🔐 Secure Authentication**: JWT-based login with encrypted passwords

### 🎨 **Modern UI/UX**
- **🍎 iOS-Inspired Design**: Clean, modern interface with Apple design language
- **📱 Responsive Layout**: Mobile-first approach with seamless desktop experience
- **🌙 Dark/Light Mode**: Automatic theme switching with user preferences
- **⚡ Smooth Animations**: Framer Motion powered transitions
- **🎯 Accessibility**: WCAG 2.1 AA compliant design
- **🔍 Advanced Filtering**: Multi-dimensional data filtering and search

### 🚀 **Advanced Capabilities**
- **📊 Real-time Calculations**: Automatic metric updates across all modules
- **📤 Data Export**: CSV/Excel export functionality
- **🔄 Offline Support**: Service worker enabled offline capabilities
- **📡 WebSocket Support**: Real-time data synchronization
- **🔍 Advanced Search**: Full-text search across all entities
- **📋 Audit Trail**: Complete activity logging and tracking

---

## 🛠️ Tech Stack

<div align="center">

### 🎨 **Frontend**
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.14.0-007fff?style=flat&logo=material-ui)](https://mui.com/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-3.29.0-319795?style=flat&logo=chakra-ui)](https://chakra-ui.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.24-0055cc?style=flat&logo=framer)](https://framer.com/motion/)
[![Recharts](https://img.shields.io/badge/Recharts-2.8.0-ff6b6b?style=flat&logo=recharts)](https://recharts.org/)

### ⚙️ **Backend**
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-68a063?style=flat&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-47a248?style=flat&logo=mongodb)](https://mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat&logo=json-web-tokens)](https://jwt.io/)

### 🚀 **Deployment & DevOps**
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=flat&logo=vercel)](https://vercel.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerization-2496ed?style=flat&logo=docker)](https://docker.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cloud_DB-47a248?style=flat&logo=mongodb)](https://mongodb.com/cloud)

</div>

---

## 🚀 Quick Start

### 📋 **Prerequisites**

Ensure you have the following installed:
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB** or **MongoDB Atlas** account ([Sign Up](https://www.mongodb.com/cloud/atlas))
- **Git** ([Install Guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))

### 🔧 **Installation**

#### **Method 1: Local Development**

```bash
# Clone the repository
git clone https://github.com/your-username/your-project-name.git
cd your-project-name

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup environment variables
cp ../backend/.env.example ../backend/.env
```

#### **Method 2: Docker (Recommended)**

```bash
# Clone repository
git clone https://github.com/your-username/your-project-name.git
cd your-project-name

# Build and run with Docker
docker-compose up --build -d

# Access the application
open http://localhost
```

### ⚙️ **Environment Configuration**

Create `backend/.env` from the template:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name
DATABASE_NAME=your_database_name

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here-min-32-chars
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3002
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 🎯 **Run the Application**

#### **Development Mode**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### **Production Mode**

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Serve build/ directory with nginx or your preferred server
```

### 🔐 **Authentication Setup**

Users need to create their own accounts through the registration process. Refer to the API documentation for authentication endpoints.

---

---

## 📊 Project Architecture

```
bavadiya-realty-dashboard/
├── 📁 backend/                     # Node.js Express API
│   ├── 📄 server.js               # Main server file
│   ├── 📄 package.json            # Dependencies
│   ├── 📄 .env.example            # Environment template
│   ├── 📄 Dockerfile              # Backend container
│   ├── 📄 employees.json          # Sample employee data
│   └── 📁 models/                 # Database models
│       ├── 📄 User.js             # User authentication model
│       ├── 📄 Payment.js          # Payment records model
│       ├── 📄 Employee.js         # Employee management model
│       └── 📄 Project.js          # Project management model
├── 📁 frontend/                    # React application
│   ├── 📁 public/                 # Static assets
│   ├── 📁 src/                    # Source code
│   │   ├── 📄 App.jsx             # Main application component
│   │   ├── 📄 index.js            # Application entry point
│   │   ├── 📁 components/         # Reusable components
│   │   │   ├── 📄 Dashboard.jsx   # Main dashboard view
│   │   │   ├── 📄 Analytics.jsx   # Analytics and charts
│   │   │   ├── 📄 DataTable.jsx   # Payment records table
│   │   │   ├── 📄 Login.jsx       # Authentication form
│   │   │   └── 📄 UserSettings.jsx # User preferences
│   │   ├── 📁 context/            # React context providers
│   │   │   └── 📄 AuthContext.jsx # Authentication context
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   ├── 📁 services/           # API service layer
│   │   └── 📁 utils/              # Utility functions
│   ├── 📄 package.json            # Dependencies
│   ├── 📄 Dockerfile              # Frontend container
│   └── 📄 nginx.conf              # Nginx configuration
├── 📁 docs/                       # Documentation
│   ├── 📄 API.md                  # API documentation
│   ├── 📄 DEPLOYMENT.md           # Deployment guide
│   └── 📄 CONTRIBUTING.md         # Contributing guidelines
├── 📄 docker-compose.yml          # Multi-container setup
├── 📄 docker-compose.prod.yml     # Production configuration
└── 📄 README.md                   # This file
```

---

## 📡 API Documentation

### 🔐 **Authentication**

#### **POST** `/api/auth/login`
User authentication endpoint

```bash
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "your_user_id",
    "username": "your_username",
    "role": "admin"
  }
}
```

### 💰 **Payment Management**

#### **GET** `/api/payments`
Retrieve all payment records (paginated)

```bash
curl -X GET "https://your-api-domain.com/api/payments?page=1&limit=10&status=received" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Filter by payment status
- `employee` (string): Filter by employee
- `project` (string): Filter by project
- `dateFrom` (string): Start date filter (YYYY-MM-DD)
- `dateTo` (string): End date filter (YYYY-MM-DD)

#### **POST** `/api/payments`
Create new payment record

```bash
curl -X POST https://your-api-domain.com/api/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "unitNo": "A-101",
    "projectName": "Sunrise Apartments",
    "ownerName": "John Doe",
    "ownerNumber": "+1234567890",
    "customerName": "Jane Smith",
    "customerNumber": "+0987654321",
    "basePrice": 500000,
    "ownerBro": 25000,
    "customerBro": 25000,
    "employee": "EMP001",
    "commission": 5
  }'
```

### 👥 **Employee Management**

#### **GET** `/api/employees`
Retrieve all employees

```bash
curl -X GET https://your-api-domain.com/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **POST** `/api/employees`
Create new employee

```bash
curl -X POST https://your-api-domain.com/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Employee",
    "code": "EMP002",
    "number": "+1234567890",
    "email": "john@yourdomain.com"
  }'
```

### 🏗️ **Project Management**

#### **GET** `/api/projects`
Retrieve all projects

```bash
curl -X GET https://your-api-domain.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **POST** `/api/projects`
Create new project

```bash
curl -X POST https://your-api-domain.com/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Villas",
    "description": "Luxury villa project",
    "location": "Your City, Your State",
    "status": "active",
    "startDate": "2024-01-01",
    "expectedCompletion": "2024-12-31"
  }'
```

### 📊 **Analytics**

#### **GET** `/api/analytics/dashboard`
Retrieve dashboard analytics

```bash
curl -X GET https://your-api-domain.com/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "totalPortfolio": 50000000,
  "totalBrokerage": 2500000,
  "ownerBrokerage": 1250000,
  "customerBrokerage": 1250000,
  "paymentReceived": 1800000,
  "outstandingAmount": 700000,
  "employeePerformance": [
    {
      "employee": "EMP001",
      "name": "John Employee",
      "totalDeals": 25,
      "totalRevenue": 1250000
    }
  ],
  "paymentStatusDistribution": {
    "received": 45,
    "partial": 12,
    "pending": 8
  }
}
```

---

## 🎨 Design System

### 🌈 **Color Palette**

<div align="center">

#### **Primary Colors**
| Color | Hex | Usage |
|-------|-----|-------|
| **iOS Blue** | `#007AFF` | Primary buttons, links |
| **Success** | `#34C759` | Success states, positive metrics |
| **Warning** | `#FF9500` | Warning states, pending items |
| **Error** | `#FF3B30` | Error states, overdue payments |

#### **Neutral Colors**
| Color | Hex | Usage |
|-------|-----|-------|
| **Background** | `#F2F2F7` | Page backgrounds |
| **Surface** | `#FFFFFF` | Cards, modals |
| **Text Primary** | `#1D1D1F` | Headings, important text |
| **Text Secondary** | `#86868B` | Body text, descriptions |
| **Border** | `#D1D1D6` | Dividers, borders |

</div>

### 🎯 **Typography**

```css
/* Headings */
.heading-xl {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.heading-lg {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
}

/* Body Text */
.body-large {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
}

.body-regular {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}
```

### 📐 **Spacing & Layout**

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
```

---

## 🔐 Security

### 🛡️ **Implemented Security Measures**

- **🔑 JWT Authentication**: Secure token-based authentication
- **🔒 Password Encryption**: bcryptjs with salt rounds 12
- **🌐 CORS Protection**: Configured allowed origins
- **🛡️ Input Validation**: Joi schema validation for all inputs
- **🚫 Rate Limiting**: Express-rate-limit for API protection
- **🔐 Helmet.js**: Security headers and XSS protection
- **📝 Audit Logging**: Complete activity logging
- **🔍 SQL Injection Prevention**: Parameterized queries only

### 🏗️ **Security Headers**

```javascript
// Implemented security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 🔐 **Environment Variables Security**

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT tokens (min 32 characters)
- Rotate secrets regularly in production
- Use different credentials for development and production

---

## 🚀 Deployment

### 🚀 **Vercel Deployment (Recommended)**

#### **Frontend Deployment**

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   cd frontend
   vercel --prod
   ```

2. **Environment Variables**
   Add in Vercel dashboard:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com
   REACT_APP_ENVIRONMENT=production
   ```

#### **Backend Deployment**

1. **Serverless Functions Setup**
   ```bash
   vercel --prod
   ```

2. **Vercel Configuration** (`vercel.json`)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/server.js"
       }
     ]
   }
   ```

### 🐳 **Docker Deployment**

#### **Development**
```bash
docker-compose up --build
```

#### **Production**
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

#### **Custom Docker Setup**
```bash
# Backend
docker build -t bavadiya-backend ./backend
docker run -p 3002:3002 -d bavadiya-backend

# Frontend
docker build -t bavadiya-frontend ./frontend
docker run -p 80:80 -d bavadiya-frontend
```

### 🌐 **Traditional VPS Deployment**

#### **Using PM2 (Process Manager)**

```bash
# Install PM2
npm install -g pm2

# Backend
cd backend
npm install --production
pm2 start ecosystem.config.js --env production

# Frontend
cd frontend
npm run build
# Serve with nginx or Apache
```

#### **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name bavadiyarealty.com;
    
    # Frontend
    location / {
        root /var/www/bavadiya-frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🧪 Testing

### 🧪 **Testing Strategy**

#### **Unit Tests**
```bash
# Frontend unit tests
cd frontend
npm test

# Backend unit tests
cd backend
npm test
```

#### **Integration Tests**
```bash
# Run all integration tests
npm run test:integration
```

#### **End-to-End Tests**
```bash
# Install Cypress
npm install cypress --save-dev

# Run E2E tests
npm run test:e2e
```

### 📊 **Test Coverage**

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

---

## 📈 Performance

### ⚡ **Optimization Features**

- **📦 Code Splitting**: Automatic route-based code splitting
- **🗄️ Database Indexing**: Optimized MongoDB indexes
- **📱 Progressive Web App**: Service worker enabled
- **🖼️ Image Optimization**: Lazy loading and WebP support
- **⚡ Caching Strategy**: Redis caching for frequently accessed data
- **📊 Bundle Analysis**: Webpack bundle analyzer integration

### 📈 **Performance Metrics**

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint** | < 1.5s | 1.2s |
| **Largest Contentful Paint** | < 2.5s | 2.1s |
| **Time to Interactive** | < 3.5s | 2.8s |
| **Cumulative Layout Shift** | < 0.1 | 0.05 |

### 🔍 **Performance Monitoring**

```javascript
// Built-in performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 🐛 Troubleshooting

### 🔧 **Common Issues**

#### **1. MongoDB Connection Issues**

**Problem**: `MongoDB connection failed`

**Solution**:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongo --host your-mongodb-host:27017

# Update environment variables
MONGODB_URI=mongodb://your-username:your-password@your-mongodb-host:27017/your-database
```

#### **2. Port Conflicts**

**Problem**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm start
```

#### **3. Build Errors**

**Problem**: Frontend build fails

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Clear React build cache
rm -rf build/
npm run build
```

#### **4. Authentication Issues**

**Problem**: JWT token invalid/expired

**Solution**:
```javascript
// Check token expiration
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(decoded.exp * 1000));

// Refresh token manually
const newToken = await refreshAuthToken();
```

#### **5. Docker Issues**

**Problem**: Container won't start

**Solution**:
```bash
# Check container logs
docker-compose logs frontend
docker-compose logs backend

# Rebuild containers
docker-compose down
docker-compose up --build

# Check docker system
docker system prune
```

### 🔍 **Debug Mode**

#### **Enable Debug Logging**

```bash
# Backend debug
DEBUG=app:* npm run dev

# Frontend debug
REACT_APP_DEBUG=true npm start

# MongoDB debug
DEBUG=mongodb:* npm start
```

#### **Browser DevTools**

1. **Open DevTools**: F12 or Cmd+Option+I
2. **Check Console**: Look for error messages
3. **Network Tab**: Verify API requests
4. **Application Tab**: Check localStorage, cookies, service worker

---

## 🤝 Contributing

### 🚀 **How to Contribute**

We welcome contributions! Please follow these guidelines:

#### **1. Development Setup**

```bash
# Fork the repository
git clone https://github.com/your-username/bavadiya-realty-dashboard.git
cd bavadiya-realty-dashboard

# Add upstream remote
git remote add upstream https://github.com/original-username/original-project-name.git

# Install dependencies
npm install
```

#### **2. Branch Strategy**

```bash
# Create feature branch
git checkout -b feature/amazing-new-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing new feature"

# Push and create PR
git push origin feature/amazing-new-feature
```

#### **3. Code Standards**

- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is automatic
- **Conventional Commits**: Use conventional commit messages
- **Tests**: Add tests for new features
- **Documentation**: Update docs for API changes

#### **4. Commit Message Format**

```
type(scope): description

feat(auth): add OAuth2 authentication
fix(dashboard): resolve chart rendering issue
docs(api): update payment endpoint documentation
style(ui): improve mobile responsiveness
refactor(models): simplify payment calculation logic
```

#### **5. Pull Request Process**

1. **Fork & Branch**: Create feature branch from `main`
2. **Code**: Follow style guidelines and add tests
3. **Test**: Run all tests locally before pushing
4. **Document**: Update README and API docs if needed
5. **PR**: Create pull request with clear description

### 🎯 **Contribution Areas**

- **🐛 Bug Fixes**: Fix existing issues
- **✨ New Features**: Add new functionality
- **📚 Documentation**: Improve docs and examples
- **🎨 UI/UX**: Enhance user interface
- **⚡ Performance**: Optimize performance
- **🔒 Security**: Improve security measures
- **🧪 Tests**: Add more test coverage

### 🏷️ **Issue Labels**

- `🐛 bug` - Something isn't working
- `✨ feature` - New feature request
- `📚 documentation` - Documentation improvements
- `🎨 ui/ux` - UI/UX design changes
- `⚡ performance` - Performance optimizations
- `🔒 security` - Security improvements
- `good first issue` - Good for newcomers

---

## 📄 License

<div align="center">

**[MIT License](LICENSE)** - Feel free to use this project for commercial or personal purposes.

**Copyright (c) 2024 Bavadiya Realty LLP**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

</div>

---

## 👨‍💻 **About the Developer**

**Jenil Rupapara**
- 🔗 **LinkedIn**: [linkedin.com/in/jenilrupapara](https://linkedin.com/in/jenilrupapara-full-stack-developer)
- 🐱 **GitHub**: [github.com/jenilrupapara001](https://github.com/jenilrupapara001)
- 📧 **Email**: jenilrupapara340@gmail.com
- 🌍 **Portfolio**: [jenilrupapara.com](https://jenilrupapara.netlify.app)

---

## 🎉 **Acknowledgments**

Special thanks to:

- **🍎 Apple Design Team** - For the beautiful iOS design language
- **⚛️ React Team** - For the amazing React framework
- **🌟 Material-UI** - For the comprehensive component library
- **🚀 Vercel** - For seamless deployment platform
- **🍃 MongoDB** - For the flexible database solution
- **🏢 Bavadiya Realty LLP** - For the opportunity to build this amazing dashboard

---

<div align="center">

**⭐ Star this repository if you find it helpful! ⭐**

**Built with ❤️ by [Jenil Rupapara](https://github.com/jenilrupapara001) for [Bavadiya Realty LLP](https://bavadiyarealty.com)**

**[⬆ Back to Top](#-bavadiya-realty-llp-dashboard)**

</div>
