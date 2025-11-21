require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://bavadiyarealty.vercel.app']; // ✅ Use frontend URL, no slash at end

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(bodyParser.json());

// ---- MongoDB Connection ----
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://jenilrupapara340_db_user:gPaASk6ZOa4Wa44L@sample-data.vyal4lo.mongodb.net/bavadiya-realty?retryWrites=true&w=majority';

// Connection options optimized for serverless (Vercel)
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds for initial connection
  socketTimeoutMS: 45000,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

// Global connection promise for serverless
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
connectToDatabase().catch(err => {
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
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Data = mongoose.model('Data', dataSchema);
const Employee = mongoose.model('Employee', employeeSchema);
const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User', userSchema);

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
      const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'DharmeshBavadiya';
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'BavadiyaRealtyAdmin!2024';
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@bavadiyarealty.com';
      
      const hashedPassword = bcrypt.hashSync(defaultPassword, parseInt(process.env.BCRYPT_ROUNDS) || 8);
      
      const defaultAdmin = new User({
        username: defaultUsername,
        password: hashedPassword,
        fullName: 'Dharmesh Bavadiya',
        email: defaultEmail,
        phone: '+91-9876543210',
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

// ---- AUTH ------------------------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Validate input
    if (!username || !password) {
      console.error('❌ Login attempt with missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Ensure database connection (for serverless)
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

// ---- DATA and EMPLOYEES now handled by MongoDB ----

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
     const newData = new Data(req.body);
     await newData.save();
     res.json({ success: true });
   } catch (error) {
     res.status(500).json({ error: 'Failed to save data' });
   }
});

app.put('/api/data/:id', authenticateToken, async (req, res) => {
   try {
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
     
     // If no employees exist, create default ones
     if (employees.length === 0) {
       const defaultEmployees = [
         { name: 'Dharmesh Bavadiya', code: 'DB001', number: '+91-9876543210' },
         { name: 'Yogesh Bavadiya', code: 'YB001', number: '+91-9876543211' },
         { name: 'Bavadiya Realty LLP', code: 'BR001', number: '+91-9876543212' },
         { name: 'Prvin Rathod', code: 'PR001', number: '+91-9876543213' },
         { name: 'Hardik Ranpariya', code: 'HR001', number: '+91-9876543214' }
       ];
       
       await Employee.insertMany(defaultEmployees);
       employees = await Employee.find();
       console.log('✅ Created default employees');
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

app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
