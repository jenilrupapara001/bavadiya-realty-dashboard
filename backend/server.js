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
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://jenilrupapara340_db_user:gPaASk6ZOa4Wa44L@sample-data.vyal4lo.mongodb.net/bavadiya-realty?appName=Sample-Data';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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
  customerBro: Number,
  customerReceiveDate: String,
  employee: String,
  commission: Number,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  code: String,
  number: String,
});

const Data = mongoose.model('Data', dataSchema);
const Employee = mongoose.model('Employee', employeeSchema);

// ---- Admin Credentials ----
const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'DharmeshBavadiya';
const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'BavadiyaRealtyAdmin!2024';

const users = [
  { username: defaultUsername, password: bcrypt.hashSync(defaultPassword, parseInt(process.env.BCRYPT_ROUNDS) || 8) }
];

// ---- AUTH ------------------------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '2h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
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

// ---- EMPLOYEE ENDPOINTS ------------------------
app.get('/api/employees', authenticateToken, async (req, res) => {
   try {
     const employees = await Employee.find();
     res.json(employees);
   } catch (error) {
     res.status(500).json({ error: 'Failed to fetch employees' });
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

app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
