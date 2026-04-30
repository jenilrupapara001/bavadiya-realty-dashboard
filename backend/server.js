require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const Joi = require('joi');

// Import company configuration
const companyConfig = require(path.join(__dirname, '../config/company.config'));

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

// Get current company configuration
const getCurrentCompanyConfig = () => {
  const companyId = process.env.COMPANY_ID || 'default';
  return companyConfig[companyId] || companyConfig.default;
};

// CORS Configuration for local development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://localhost:3002'];

// Security middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(bodyParser.json());

// Add security headers
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Request logging
const morgan = require('morgan');
app.use(morgan('combined'));

// Add database indexing
async function createDatabaseIndexes() {
  try {
    // Create indexes for better performance
    await Data.createIndexes([
      { key: { projectName: 1 } },
      { key: { employee: 1 } },
      { key: { date: 1 } },
      { key: { receiveDate: 1 } },
      { key: { customerReceiveDate: 1 } }
    ]);

    await Employee.createIndexes([
      { key: { name: 1 } },
      { key: { code: 1 } }
    ]);

    await Project.createIndexes([
      { key: { name: 1 } },
      { key: { status: 1 } }
    ]);

    await User.createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } }
    ]);

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error.message);
  }
}

// ---- MongoDB Connection ----
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/realestate-dashboard';

// Connection options for local and cloud MongoDB
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: parseInt(process.env.MONGOOSE_SERVER_SELECTION_TIMEOUT) || 10000,
  socketTimeoutMS: parseInt(process.env.MONGOOSE_SOCKET_TIMEOUT) || 45000,
  maxPoolSize: parseInt(process.env.MONGOOSE_MAX_POOL_SIZE) || 10,
  minPoolSize: parseInt(process.env.MONGOOSE_MIN_POOL_SIZE) || 1,
  maxIdleTimeMS: parseInt(process.env.MONGOOSE_MAX_IDLE_TIME_MS) || 30000,
  connectTimeoutMS: parseInt(process.env.MONGOOSE_CONNECT_TIMEOUT_MS) || 10000,
  retryWrites: true,
  retryReads: true,
};

// Global connection promise
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    cachedConnection = await mongoose.connect(mongoURI, mongoOptions);
    console.log('✅ MongoDB connected successfully');

    // Initialize default admin if no users exist (only on first connection)
    await initializeDefaultAdmin();
    await initializeDefaultData();

    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('❌ Full error:', err);
    cachedConnection = null;
    throw err;
  }
}

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  cachedConnection = null;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Initial connection attempt
connectToDatabase().then(() => {
  // Create indexes after successful connection
  createDatabaseIndexes();
}).catch(err => {
  console.error('❌ Initial MongoDB connection failed:', err.message);
});

// ---- Schemas ----
const dataSchema = new mongoose.Schema({
  date: String,
  unitNo: String,
  projectName: String,
  ownerName: String,
  ownerNumber: String,
  customerName: String,
  customerNumber: String,
  timePeriod: String,
  basePrice: Number,
  ownerBro: Number,
  receiveDate: String,
  ownerReceivedBy: String,
  customerBro: Number,
  customerReceiveDate: String,
  customerReceivedBy: String,
  employee: String, // Stores employee name only
  commission: Number,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  code: String,
  number: String,
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, default: 'User', enum: ['Admin', 'Manager', 'User'] },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp before saving
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Data = mongoose.model('Data', dataSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User', userSchema);

// Validation schemas
const dataSchemaValidation = Joi.object({
  date: Joi.string().required(),
  unitNo: Joi.string().required(),
  projectName: Joi.string().required(),
  ownerName: Joi.string().required(),
  ownerNumber: Joi.string().required(),
  customerName: Joi.string().required(),
  customerNumber: Joi.string().required(),
  timePeriod: Joi.string().required(),
  basePrice: Joi.number().required(),
  ownerBro: Joi.number(),
  receiveDate: Joi.string(),
  ownerReceivedBy: Joi.string(),
  customerBro: Joi.number(),
  customerReceiveDate: Joi.string(),
  customerReceivedBy: Joi.string(),
  employee: Joi.string().required(),
  commission: Joi.number().required()
});

const employeeSchemaValidation = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  number: Joi.string().required()
});

const projectSchemaValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  location: Joi.string(),
  status: Joi.string().valid('Active', 'Completed', 'On Hold')
});

const userSchemaValidation = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string(),
  role: Joi.string().valid('Admin', 'Manager', 'User')
});

// ---- HEALTH CHECK ENDPOINT ----
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const health = {
      status: dbState === 1 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        state: dbStateMap[dbState],
        stateCode: dbState
      },
      environment: process.env.NODE_ENV || 'development'
    };

    // Try to count users to verify DB is working
    if (dbState === 1) {
      try {
        const userCount = await User.countDocuments();
        health.database.userCount = userCount;
      } catch (err) {
        health.database.error = err.message;
      }
    }

    res.status(dbState === 1 ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ---- INITIALIZATION: Create default admin if no users exist ----
async function initializeDefaultAdmin() {
  try {
    const userCount = await User.countDocuments({ isActive: true });

    if (userCount === 0) {
      const companyConf = getCurrentCompanyConfig();
      const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@realestate.com';
      const defaultPhone = process.env.DEFAULT_ADMIN_PHONE || '+1-000-000-0000';

      const hashedPassword = bcrypt.hashSync(defaultPassword, parseInt(process.env.BCRYPT_ROUNDS) || 8);

      const defaultAdmin = new User({
        username: defaultUsername,
        password: hashedPassword,
        fullName: companyConf.company.name + ' Administrator',
        email: defaultEmail,
        phone: defaultPhone,
        role: 'Admin'
      });

      await defaultAdmin.save();
      console.log(`✅ Default admin user created: ${defaultUsername}`);
      console.log(`📝 Default password: ${defaultPassword}`);
      console.log(`⚠️ Please change this password after first login!`);
    } else {
      console.log(`✅ Found ${userCount} existing user(s) in database`);
    }
  } catch (error) {
    console.error('❌ Error initializing default admin:', error);
  }
}

/**
 * Initializes default data (employees, projects, and payments)
 * if the database is empty.
 */
async function initializeDefaultData() {
  try {
    const dataCount = await Data.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const projectCount = await Project.countDocuments();

    if (dataCount === 0 || employeeCount === 0 || projectCount === 0) {
      console.log('🔄 Initializing default database data...');
      const companyConf = getCurrentCompanyConfig();

      // Seed Employees from configuration
      if (employeeCount === 0) {
        const defaultEmployees = companyConf.employees || [];
        if (defaultEmployees.length > 0) {
          await Employee.insertMany(defaultEmployees);
          console.log(`✅ Seeded ${defaultEmployees.length} employees from config`);
        }
      }

      // Seed Data and Projects from JSON file
      if (dataCount === 0) {
        const dataPath = path.join(__dirname, 'data.json');
        if (fs.existsSync(dataPath)) {
          const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          
          // Seed Payment Records
          const processedData = rawData.map(item => ({
            ...item,
            commission: item.commission || (item.basePrice * 0.02) // Default 2% commission
          }));
          await Data.insertMany(processedData);
          console.log(`✅ Seeded ${processedData.length} payment records from data.json`);

          // Seed Projects from unique projectNames in data.json
          if (projectCount === 0) {
            const projectNames = [...new Set(rawData.map(item => item.projectName))];
            const projects = projectNames.map(name => ({
              name,
              description: `${name} Real Estate Project`,
              location: 'Surat, Gujarat',
              status: 'Active'
            }));
            await Project.insertMany(projects);
            console.log(`✅ Seeded ${projects.length} projects from data.json`);
          }
        } else {
          console.log('⚠️ data.json not found, skipping data seeding');
        }
      }
    } else {
      console.log(`✅ Database already contains data (${dataCount} payments, ${employeeCount} employees, ${projectCount} projects)`);
    }
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
}

// ---- AUTH ------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      console.error('❌ Login attempt with missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB not connected, attempting to connect...');
      try {
        await connectToDatabase();
      } catch (connErr) {
        console.error('❌ Failed to connect to MongoDB:', connErr.message);
        return res.status(503).json({
          error: 'Database connection unavailable',
          details: process.env.NODE_ENV === 'development' ? connErr.message : undefined
        });
      }
    }

    // Double-check connection state
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB still not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ error: 'Database connection unavailable' });
    }

    console.log(`🔍 Login attempt for user: ${username}`);

    // Check database users only
    const dbUser = await User.findOne({ username, isActive: true });

    if (!dbUser) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`✅ User found: ${username}, verifying password...`);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordValid) {
      console.log(`❌ Invalid password for user: ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`✅ Password verified for user: ${username}`);

    // Update last login
    dbUser.lastLogin = new Date();
    await dbUser.save();

    // Create JWT token with extended expiration (30 days)
    const token = jwt.sign({
      username: dbUser.username,
      id: dbUser._id,
      role: dbUser.role
    }, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '720h' }); // 30 days = 720 hours

    const userResponse = dbUser.toObject();
    delete userResponse.password;

    console.log(`✅ User ${dbUser.username} logged in successfully`);

    return res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('❌ Stack trace:', error.stack);
    return res.status(500).json({
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ---- DATA ENDPOINTS ----
app.get('/api/data', authenticateToken, async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/data', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error } = dataSchemaValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newData = new Data(req.body);
    await newData.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.put('/api/data/:id', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error } = dataSchemaValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await Data.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

app.delete('/api/data/:id', authenticateToken, async (req, res) => {
  try {
    await Data.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// ---- EMPLOYEE ENDPOINTS ------------------------
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    let employees = await Employee.find();

    // Initialize default employees based on company configuration
    if (employees.length === 0) {
      const companyConf = getCurrentCompanyConfig();
      const defaultEmployees = companyConf.employees || [
        { name: 'Admin User', code: 'ADMIN001', number: '+1-000-000-0000' },
        { name: 'Manager User', code: 'MGR001', number: '+1-000-000-0001' }
      ];

      await Employee.insertMany(defaultEmployees);
      employees = await Employee.find();
      console.log(`✅ Created default employees for ${companyConf.company.name}`);
    }

    res.json(employees);
  } catch (error) {
    console.error('❌ Error fetching employees:', error.message);
    res.status(500).json({ error: 'Failed to fetch employees', details: error.message });
  }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save employee' });
  }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error } = employeeSchemaValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await Employee.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// ---- PROJECT ENDPOINTS ------------------------
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error } = projectSchemaValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    await Project.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ---- USER ENDPOINTS ------------------------
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error } = userSchemaValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password, fullName, email, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS) || 8);
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      phone,
      role: role || 'User'
    });

    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone, role, isActive } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 8);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ---- COMPANY CONFIG ENDPOINT ------------------------
app.get('/api/company/config', (req, res) => {
  try {
    const companyConf = getCurrentCompanyConfig();
    res.json({
      company: companyConf.company,
      dashboard: companyConf.dashboard
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company configuration' });
  }
});

// ---- ANALYTICS ENDPOINT ------------------------
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const [data, employees, projects] = await Promise.all([
      Data.find(),
      Employee.find(),
      Project.find()
    ]);

    // Calculate analytics
    const totalPortfolio = data.reduce((sum, item) => sum + (item.basePrice || 0), 0);
    const totalBrokerage = data.reduce((sum, item) => {
      const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : (parseFloat(item.ownerBro) / 100) * parseFloat(item.basePrice);
      const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : (parseFloat(item.customerBro) / 100) * parseFloat(item.basePrice);
      return sum + ownerBrok + customerBrok;
    }, 0);

    const paymentReceived = data.reduce((sum, item) => {
      let amount = 0;
      if (item.receiveDate) amount += (typeof item.ownerBro === 'number' ? item.ownerBro : (parseFloat(item.ownerBro) / 100) * parseFloat(item.basePrice));
      if (item.customerReceiveDate) amount += (typeof item.customerBro === 'number' ? item.customerBro : (parseFloat(item.customerBro) / 100) * parseFloat(item.basePrice));
      return sum + amount;
    }, 0);

    const outstandingAmount = totalBrokerage - paymentReceived;

    // Employee performance
    const employeePerformance = data.reduce((acc, item) => {
      const empName = item.employee || 'Unknown';
      const basePrice = item.basePrice || 0;
      acc[empName] = (acc[empName] || 0) + basePrice;
      return acc;
    }, {});

    // Project distribution
    const projectDistribution = data.reduce((acc, item) => {
      const project = item.projectName || 'Unknown';
      if (!acc[project]) {
        acc[project] = { deals: 0, value: 0 };
      }
      acc[project].deals += 1;
      acc[project].value += item.basePrice || 0;
      return acc;
    }, {});

    res.json({
      totalPortfolio,
      totalBrokerage,
      paymentReceived,
      outstandingAmount,
      employeePerformance,
      projectDistribution,
      totalEmployees: employees.length,
      totalProjects: projects.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ---- EXPORT ENDPOINT ------------------------
app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    const { type = 'csv', dataType = 'payments' } = req.query;

    if (dataType === 'payments') {
      const payments = await Data.find();

      if (type === 'csv') {
        const csvHeader = 'Date,Unit No,Project,Owner,Customer,Base Price,Owner Bro,Customer Bro,Employee,Commission,Status\n';
        const csvRows = payments.map(item =>
          `${item.date || ''},${item.unitNo || ''},${item.projectName || ''},${item.ownerName || ''},${item.customerName || ''},${item.basePrice || 0},${item.ownerBro || 0},${item.customerBro || 0},${item.employee || ''},${item.commission || 0},${(item.receiveDate && item.customerReceiveDate) ? 'Received' : 'Pending'}`
        ).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('payments_export.csv');
        return res.send(csvHeader + csvRows);
      }
    }

    res.status(400).json({ error: 'Invalid export parameters' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// ---- AUDIT LOGGING ENDPOINT ------------------------
app.get('/api/audit', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would query an audit log collection
    // For now, return a mock response
    res.json({
      logs: [
        { timestamp: new Date().toISOString(), action: 'User login', user: req.user.username },
        { timestamp: new Date().toISOString(), action: 'Data fetch', user: req.user.username }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ---- NOTIFICATIONS ENDPOINT ------------------------
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, this would query notifications
    // For now, return a mock response
    res.json({
      notifications: [
        { id: 1, message: 'New payment received', read: false, timestamp: new Date().toISOString() },
        { id: 2, message: 'Project updated', read: true, timestamp: new Date().toISOString() }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ---- ADVANCED SEARCH ENDPOINT ------------------------
app.get('/api/search', authenticateToken, async (req, res) => {
  try {
    const { query, type = 'all' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i');

    if (type === 'all' || type === 'payments') {
      const paymentResults = await Data.find({
        $or: [
          { projectName: searchRegex },
          { ownerName: searchRegex },
          { customerName: searchRegex },
          { employee: searchRegex }
        ]
      });

      if (type === 'payments') {
        return res.json({ results: paymentResults, type: 'payments' });
      }
    }

    if (type === 'all' || type === 'employees') {
      const employeeResults = await Employee.find({
        $or: [
          { name: searchRegex },
          { code: searchRegex }
        ]
      });

      if (type === 'employees') {
        return res.json({ results: employeeResults, type: 'employees' });
      }
    }

    if (type === 'all' || type === 'projects') {
      const projectResults = await Project.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      });

      if (type === 'projects') {
        return res.json({ results: projectResults, type: 'projects' });
      }
    }

    // For 'all' type, combine results
    const [payments, employees, projects] = await Promise.all([
      Data.find({
        $or: [
          { projectName: searchRegex },
          { ownerName: searchRegex },
          { customerName: searchRegex },
          { employee: searchRegex }
        ]
      }),
      Employee.find({
        $or: [
          { name: searchRegex },
          { code: searchRegex }
        ]
      }),
      Project.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
    ]);

    res.json({
      results: {
        payments,
        employees,
        projects
      },
      type: 'all'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

app.listen(PORT, () => {
  const companyConf = getCurrentCompanyConfig();
  console.log(`✅ API running on port ${PORT}`);
  console.log(`🏢 Company: ${companyConf.company.name}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
