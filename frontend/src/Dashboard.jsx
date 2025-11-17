
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Grow,
} from '@mui/material';
import { Logout, Add, Edit, Delete, Dashboard as DashboardIcon, BarChart as BarChartIcon, TableChart, Menu, Person as PersonIcon } from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useMediaQuery } from '@mui/material';
import Analytics from './Analytics';
import DataTable from './DataTable';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReceivedBy, setFilterReceivedBy] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    code: '',
    number: '',
  });
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'Active',
  });
  const [projectOpen, setProjectOpen] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    unitNo: '',
    projectName: '',
    ownerName: '',
    ownerNumber: '',
    customerName: '',
    customerNumber: '',
    timePeriod: '',
    basePrice: '',
    ownerBro: '',
    receiveDate: '',
    ownerReceivedBy: '',
    customerBro: '',
    customerReceiveDate: '',
    customerReceivedBy: '',
    employee: '',
    commission: '',
  });

  useEffect(() => {
    fetchData();
    fetchEmployees();
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = data;
    if (filterDateFrom || filterDateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.receiveDate);
        const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
        const toDate = filterDateTo ? new Date(filterDateTo) : null;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }
    if (filterEmployee) {
      filtered = filtered.filter(item => item.employee === filterEmployee);
    }
    if (filterProject) {
      filtered = filtered.filter(item => item.projectName === filterProject);
    }
    if (filterStatus) {
      if (filterStatus === 'received') {
        filtered = filtered.filter(item => item.receiveDate && item.customerReceiveDate);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(item => !item.receiveDate || !item.customerReceiveDate);
      }
    }
    if (filterReceivedBy) {
      filtered = filtered.filter(item => item.receivedBy === filterReceivedBy);
    }
    setFilteredData(filtered);
  }, [data, filterDateFrom, filterDateTo, filterEmployee, filterProject, filterStatus, filterReceivedBy, employees]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://bavadiya-realty-backend.vercel.app/api/data', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://bavadiya-realty-backend.vercel.app/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://bavadiya-realty-backend.vercel.app/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };


  const handleOpen = (index = null) => {
    if (index !== null) {
      setFormData(data.find(item => item._id === index));
      setEditingIndex(index);
    } else {
      setFormData({
        date: '',
        unitNo: '',
        projectName: '',
        ownerName: '',
        ownerNumber: '',
        customerName: '',
        customerNumber: '',
        timePeriod: '',
        basePrice: '',
        ownerBro: '',
        receiveDate: '',
        customerBro: '',
        customerReceiveDate: '',
        employee: '',
        commission: '',
      });
      setEditingIndex(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setFormData({
      date: '',
      unitNo: '',
      projectName: '',
      ownerName: '',
      ownerNumber: '',
      customerName: '',
      customerNumber: '',
      timePeriod: '',
      basePrice: '',
      ownerBro: '',
      receiveDate: '',
      ownerReceivedBy: '',
      customerBro: '',
      customerReceiveDate: '',
      customerReceivedBy: '',
      employee: '',
      commission: '',
    });
    setEditingIndex(null);
    setOpen(false);
  };

  const validateForm = () => {
    const requiredFields = [
      'date', 'unitNo', 'projectName', 'ownerName', 'ownerNumber',
      'customerName', 'customerNumber', 'timePeriod', 'basePrice',
      'employee', 'commission'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field] === '') {
        return false;
      }
    }
    return true;
  };

  const convertPercentageToAmount = (percentage, basePrice) => {
    if (!percentage || !basePrice) return 0;
    return (parseFloat(percentage) / 100) * parseFloat(basePrice);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please fill all required fields!', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (editingIndex !== null) {
        await axios.put(`https://bavadiya-realty-backend.vercel.app/api/data/${editingIndex}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Payment entry updated successfully!', severity: 'success' });
      } else {
        await axios.post('https://bavadiya-realty-backend.vercel.app/api/data', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Payment entry added successfully!', severity: 'success' });
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving data:', error);
      setSnackbar({ open: true, message: 'Error saving entry. Please try again.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://bavadiya-realty-backend.vercel.app/api/data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Entry deleted successfully!', severity: 'success' });
        fetchData();
      } catch (error) {
        console.error('Error deleting entry:', error);
        setSnackbar({ open: true, message: 'Error deleting entry. Please try again.', severity: 'error' });
      }
    }
  };

  const handleEmployeeSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingEmployeeIndex !== null) {
        await axios.put(`https://bavadiya-realty-backend.vercel.app/api/employees/${editingEmployeeIndex}`, employeeFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Employee updated successfully!', severity: 'success' });
      } else {
        await axios.post('https://bavadiya-realty-backend.vercel.app/api/employees', employeeFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Employee added successfully!', severity: 'success' });
      }
      fetchEmployees();
      setEmployeeOpen(false);
      setEmployeeFormData({ name: '', code: '', number: '' });
      setEditingEmployeeIndex(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      setSnackbar({ open: true, message: 'Error saving employee. Please try again.', severity: 'error' });
    }
  };

  const handleProjectSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingProjectIndex !== null) {
        await axios.put(`https://bavadiya-realty-backend.vercel.app/api/projects/${editingProjectIndex}`, projectFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Project updated successfully!', severity: 'success' });
      } else {
        await axios.post('https://bavadiya-realty-backend.vercel.app/api/projects', projectFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Project added successfully!', severity: 'success' });
      }
      fetchProjects();
      setProjectOpen(false);
      setProjectFormData({ name: '', description: '', location: '', status: 'Active' });
      setEditingProjectIndex(null);
    } catch (error) {
      console.error('Error saving project:', error);
      setSnackbar({ open: true, message: 'Error saving project. Please try again.', severity: 'error' });
    }
  };

  const handleProjectDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://bavadiya-realty-backend.vercel.app/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Project deleted successfully!', severity: 'success' });
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        setSnackbar({ open: true, message: 'Error deleting project. Please try again.', severity: 'error' });
      }
    }
  };

  const totalPortfolio = data.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  const totalBrokerage = data.reduce((sum, item) => sum + (item.ownerBro || 0) + (item.customerBro || 0), 0);
  const totalOwnerBrok = data.reduce((sum, item) => sum + (item.ownerBro || 0), 0);
  const totalCustomerBrok = data.reduce((sum, item) => sum + (item.customerBro || 0), 0);

  // Payment received logic: based on receive dates
  const paymentReceived = data.reduce((sum, item) => {
    let amount = 0;
    if (item.receiveDate) amount += (item.ownerBro || 0); // Owner brokerage if owner receive date filled
    if (item.customerReceiveDate) amount += (item.customerBro || 0); // Customer brokerage if customer receive date filled
    return sum + amount;
  }, 0);

  const outstandingAmount = totalBrokerage - paymentReceived;

  const employeeData = data.reduce((acc, item) => {
    const emp = employees.find(e => e.code === item.employee);
    const empName = emp ? emp.name : item.employee;
    // Calculate commission amount: (commission % * basePrice) / 100
    const commissionAmount = ((item.commission || 0) * (item.basePrice || 0)) / 100;
    acc[empName] = (acc[empName] || 0) + commissionAmount;
    return acc;
  }, {});
  const chartData = Object.entries(employeeData).map(([name, value]) => ({ name, value }));

  const pieData = [
    { name: 'Received', value: paymentReceived, color: '#059669' },
    { name: 'Outstanding', value: outstandingAmount, color: '#d97706' },
  ];

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
    { text: 'Analytics Overview', icon: <BarChartIcon />, view: 'analytics' },
    { text: 'Payment Records', icon: <TableChart />, view: 'table' },
    { text: 'Project Management', icon: <TableChart />, view: 'projects' },
    { text: 'Employee Management', icon: <PersonIcon />, view: 'employees' },
    { text: 'Account Settings', icon: <PersonIcon />, view: 'settings' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'analytics':
        return <Analytics />;
      case 'table':
        return <DataTable onEditEntry={(row) => {
          const itemToEdit = data.find(item => item._id === row._id);
          if (itemToEdit) {
            setFormData(itemToEdit);
            setEditingIndex(row._id);
            setOpen(true);
          }
        }} />;
      case 'employees':
        return (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
              Employee Management
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setEmployeeOpen(true)}>
                Add Employee
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white', fontWeight: 600 } }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Number</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp, index) => (
                    <TableRow key={index}>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.code}</TableCell>
                      <TableCell>{emp.number}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => { setEmployeeFormData(emp); setEditingEmployeeIndex(emp._id); setEmployeeOpen(true); }}>
                          <Edit />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        );
      case 'projects':
        return (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
              Project Management
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => setProjectOpen(true)}>
                Add Project
              </Button>
            </Box>

            {/* Projects Table */}
            <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main', '& th': { color: 'white', fontWeight: 600 } }}>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Total Deals</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.map((project) => {
                      // Calculate project statistics from data
                      const projectStats = data.filter(item => item.projectName === project.name).reduce((acc, item) => {
                        acc.deals += 1;
                        acc.value += item.basePrice || 0;
                        return acc;
                      }, { deals: 0, value: 0 });

                      return (
                        <TableRow key={project._id}>
                          <TableCell sx={{ fontWeight: 500 }}>{project.name}</TableCell>
                          <TableCell>{project.description || '-'}</TableCell>
                          <TableCell>{project.location || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={project.status}
                              color={project.status === 'Active' ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{projectStats.deals}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ₹{projectStats.value.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => {
                              setProjectFormData(project);
                              setEditingProjectIndex(project._id);
                              setProjectOpen(true);
                            }}>
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => handleProjectDelete(project._id)}
                              sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Container>
        );
      case 'settings':
        return (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
              Account Settings
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Profile Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        defaultValue="admin"
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Role"
                        defaultValue="Administrator"
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Account Created"
                        defaultValue="2024-01-15"
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Login"
                        defaultValue={new Date().toLocaleString()}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Account Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="contained" color="primary" fullWidth sx={{ borderRadius: 2 }}>
                      Update Profile
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      fullWidth
                      sx={{ borderRadius: 2 }}
                      onClick={() => setSnackbar({ open: true, message: 'Data export feature coming soon!', severity: 'info' })}
                    >
                      Export Data
                    </Button>
                    <Button variant="outlined" color="error" fullWidth onClick={logout} sx={{ borderRadius: 2 }}>
                      Sign Out
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        );
      case 'dashboard':
      default:
        return (
          <>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress size={60} />
              </Box>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <>
                {/* Welcome Header */}
                <Grow in={true} timeout={1000}>
                  <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                      }}
                    >
                      Welcome to Bavadiya Realty LLP
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      Real Estate Payment Management Dashboard
                    </Typography>
                  </Box>
                </Grow>

                {/* Cards On Dashboard */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                          Total Portfolio
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5, fontSize: '1.1rem' }}>
                          ₹{totalPortfolio.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          Base Price • All transactions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                          Total Brokerage
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5, fontSize: '1.1rem' }}>
                          ₹{totalBrokerage.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          Owner + Customer commissions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                          Owner Brokerage
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'info.main', mb: 0.5, fontSize: '1.1rem' }}>
                          ₹{totalOwnerBrok.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          Owner commissions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                          Customer Brokerage
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 0.5, fontSize: '1.1rem' }}>
                          ₹{totalCustomerBrok.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          Customer commissions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                          Payment Received
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 0.5, fontSize: '1.1rem' }}>
                          ₹{paymentReceived.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          Based on receive dates
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                          Outstanding Amount
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'error.main', mb: 0.5, fontSize: '1.1rem' }}>
                          ₹{outstandingAmount.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          Pending payments
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Analytics Overview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
                    Analytics Overview (All based on Total Brokerage)
                  </Typography>
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{
                        p: { xs: 1.5, sm: 2 },
                        height: { xs: 280, sm: 320 },
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 2,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          Payments by Employee
                        </Typography>
                        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                          <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                            <BarChart
                              data={chartData}
                              margin={{
                                top: 20,
                                right: 20,
                                left: 10,
                                bottom: 60
                              }}
                              barCategoryGap="15%"
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e0e0e0"
                                opacity={0.3}
                                vertical={false}
                              />
                              <XAxis
                                dataKey="name"
                                tick={{
                                  fontSize: 11,
                                  fill: '#64748b'
                                }}
                                axisLine={false}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval={0}
                              />
                              <YAxis
                                tick={{
                                  fontSize: 11,
                                  fill: '#64748b'
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                                width={50}
                              />
                              <Tooltip
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                labelFormatter={(label) => `${label}`}
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: 'none',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                  fontSize: '13px',
                                  fontWeight: 500
                                }}
                                cursor={{ fill: 'rgba(0, 122, 255, 0.1)' }}
                              />
                              <Bar
                                dataKey="value"
                                fill="#007AFF"
                                radius={[6, 6, 0, 0]}
                                animationBegin={0}
                                animationDuration={1000}
                                animationEasing="ease-out"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{
                        p: { xs: 1.5, sm: 2 },
                        height: { xs: 280, sm: 320 },
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 2,
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          Payment Status Distribution
                        </Typography>
                        <Box sx={{
                          flexGrow: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 0
                        }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="45%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={{ xs: 65, sm: 85 }}
                                innerRadius={{ xs: 30, sm: 40 }}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={2}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                                contentStyle={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #ddd',
                                  borderRadius: '12px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  fontSize: { xs: '11px', sm: '12px' }
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Payment Records */}
                <Box sx={{
                  mt: { xs: 3, md: 4 },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: { xs: 2, sm: 0 },
                  mb: 3
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 600
                    }}
                  >
                    Payment Records
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{
                      bgcolor: 'primary.main',
                      alignSelf: { xs: 'flex-start', sm: 'auto' },
                      minWidth: { xs: '100%', sm: 'auto' },
                      borderRadius: 3
                    }}
                    size="large"
                  >
                    Add New Entry
                  </Button>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Filters
                  </Typography>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={2}>
                      <TextField
                        label="From Date"
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        label="To Date"
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }} size="small" fullWidth>
                        <InputLabel>Employee Name</InputLabel>
                        <Select
                          value={filterEmployee}
                          label="Employee Name"
                          onChange={(e) => setFilterEmployee(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {employees.map((emp, index) => (
                            <MenuItem key={index} value={emp.code}>{emp.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }} size="small" fullWidth>
                        <InputLabel>Project</InputLabel>
                        <Select
                          value={filterProject}
                          label="Project"
                          onChange={(e) => setFilterProject(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {[...new Set(data.map(item => item.projectName))].map(proj => (
                            <MenuItem key={proj} value={proj}>{proj}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }} size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filterStatus}
                          label="Status"
                          onChange={(e) => setFilterStatus(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="received">Received</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }} size="small" fullWidth>
                        <InputLabel>Received By</InputLabel>
                        <Select
                          value={filterReceivedBy}
                          label="Received By"
                          onChange={(e) => setFilterReceivedBy(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="Dharmesh Bavadiya">Dharmesh Bavadiya</MenuItem>
                          <MenuItem value="Yogesh Bavadiya">Yogesh Bavadiya</MenuItem>
                          <MenuItem value="Bavadiya Realty LLP">Bavadiya Realty LLP</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Table */}
                <TableContainer component={Paper} sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'auto',
                  '& .MuiTable-root': {
                    minWidth: { xs: 600, sm: 650 }
                  }
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{
                        bgcolor: 'primary.main',
                        '& th': {
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }
                      }}>
                        <TableCell>Date</TableCell>
                        <TableCell>Unit No</TableCell>
                        <TableCell>Project</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Base Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Commission (%)</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell>Delete</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.slice(0, 10).map((row, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                            '&:hover': { bgcolor: 'action.selected' },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{row.date}</TableCell>
                          <TableCell>{row.unitNo}</TableCell>
                          <TableCell>{row.projectName}</TableCell>
                          <TableCell>{row.ownerName}</TableCell>
                          <TableCell>{row.customerName}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ₹{row.basePrice?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.receiveDate && row.customerReceiveDate ? 'Received' : row.customerReceiveDate ? 'Partial' : 'Pending'}
                              color={row.receiveDate && row.customerReceiveDate ? 'success' : row.customerReceiveDate ? 'warning' : 'error'}
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            />
                          </TableCell>
                          <TableCell>{employees.find(e => e.code === row.employee)?.name || row.employee}</TableCell>
                          <TableCell>{row.commission}%</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                const itemToEdit = data.find(item => item._id === row._id);
                                if (itemToEdit) {
                                  setFormData(itemToEdit);
                                  setEditingIndex(row._id);
                                  setOpen(true);
                                }
                              }}
                              sx={{ borderRadius: 2 }}
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleDelete(row._id)}
                              sx={{
                                borderRadius: 2,
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'white'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F2F2F7' }}>
      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #007AFF 0%, #5856D6 100%)',
        boxShadow: '0 4px 20px rgba(0, 122, 255, 0.1)',
        borderRadius: 0
      }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setDrawerOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Bavadiya Realty LLP
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={isMobile ? () => setDrawerOpen(false) : undefined}
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #F2F2F7 0%, #E5E5EA 100%)',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
            borderRadius: 0
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Realty Management
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={activeView === item.view}
                  onClick={() => {
                    setActiveView(item.view);
                    if (isMobile) setDrawerOpen(false);
                  }}
                  sx={{
                    borderRadius: 3,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 122, 255, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
        </Box>
      </Drawer>

      <Box component="main" sx={{
        flexGrow: 1,
        p: 0,
        minHeight: 'calc(100vh - 64px)',
        marginLeft: isMobile ? 0 : '280px'
      }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ p: 4, pb: 8 }}>
          {renderView()}
        </Container>

        {/* Input Form Modal */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="lg"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
          }}>
            {editingIndex !== null ? 'Edit Payment Entry' : 'Add New Payment Entry'}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              All fields are required except Receive Date and Owner/Customer Brokerage. Calculate brokerage based on base price percentage.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Unit No"
                  value={formData.unitNo}
                  onChange={(e) => setFormData({ ...formData, unitNo: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Project Name</InputLabel>
                  <Select
                    required
                    value={formData.projectName}
                    label="Project Name"
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Project</MenuItem>
                    {[...new Set(data.map(item => item.projectName))].map(proj => (
                      <MenuItem key={proj} value={proj}>{proj}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Owner Name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Owner Number"
                  value={formData.ownerNumber}
                  onChange={(e) => setFormData({ ...formData, ownerNumber: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Customer Number"
                  value={formData.customerNumber}
                  onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Time Period"
                  value={formData.timePeriod}
                  onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Base Price"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || '' })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    fullWidth
                    label="Owner Brokerage (%)"
                    type="number"
                    value={formData.ownerBro || ''}
                    onChange={(e) => setFormData({ ...formData, ownerBro: parseFloat(e.target.value) || '' })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={() => {
                            const amount = convertPercentageToAmount(formData.ownerBro, formData.basePrice);
                            setFormData({ ...formData, ownerBro: amount });
                          }}
                          sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                        >
                          %
                        </Button>
                      ),
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Owner Receive Date"
                  type="date"
                  value={formData.receiveDate}
                  onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Owner Received By</InputLabel>
                  <Select
                    value={formData.ownerReceivedBy || ''}
                    label="Owner Received By"
                    onChange={(e) => setFormData({ ...formData, ownerReceivedBy: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Dharmesh Bavadiya">Dharmesh</MenuItem>
                    <MenuItem value="Yogesh Bavadiya">Yogesh</MenuItem>
                    <MenuItem value="Bavadiya Realty LLP">Company</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <TextField
                    fullWidth
                    label="Customer Brokerage (%)"
                    type="number"
                    value={formData.customerBro || ''}
                    onChange={(e) => setFormData({ ...formData, customerBro: parseFloat(e.target.value) || '' })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={() => {
                            const amount = convertPercentageToAmount(formData.customerBro, formData.basePrice);
                            setFormData({ ...formData, customerBro: amount });
                          }}
                          sx={{ minWidth: 'auto', px: 1, fontSize: '0.75rem' }}
                        >
                          %
                        </Button>
                      ),
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Customer Receive Date"
                  type="date"
                  value={formData.customerReceiveDate}
                  onChange={(e) => setFormData({ ...formData, customerReceiveDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Customer Received By</InputLabel>
                  <Select
                    value={formData.customerReceivedBy || ''}
                    label="Customer Received By"
                    onChange={(e) => setFormData({ ...formData, customerReceivedBy: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Dharmesh Bavadiya">Dharmesh</MenuItem>
                    <MenuItem value="Yogesh Bavadiya">Yogesh</MenuItem>
                    <MenuItem value="Bavadiya Realty LLP">Company</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    required
                    value={formData.employee}
                    label="Employee"
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Select Employee</MenuItem>
                    {employees.map((emp, index) => (
                      <MenuItem key={index} value={emp.code}>{emp.name} ({emp.code})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Employee Commission (%)"
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || '' })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Save Entry
            </Button>
          </DialogActions>
        </Dialog>

        {/* Employee Dialog */}
        <Dialog
          open={employeeOpen}
          onClose={() => setEmployeeOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
          }}>
            {editingEmployeeIndex !== null ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter employee details below.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={employeeFormData.name}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Code"
                  value={employeeFormData.code}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, code: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Number"
                  value={employeeFormData.number}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, number: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button
              onClick={() => { setEmployeeOpen(false); setEmployeeFormData({ name: '', code: '', number: '' }); setEditingEmployeeIndex(null); }}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmployeeSave}
              variant="contained"
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Project Dialog */}
        <Dialog
          open={projectOpen}
          onClose={() => setProjectOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }
          }}
        >
          <DialogTitle sx={{
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.25rem',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
          }}>
            {editingProjectIndex !== null ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter project details below.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  multiline
                  rows={3}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={projectFormData.location}
                  onChange={(e) => setProjectFormData({ ...projectFormData, location: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={projectFormData.status}
                    label="Status"
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="On Hold">On Hold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <Button
              onClick={() => { setProjectOpen(false); setProjectFormData({ name: '', description: '', location: '', status: 'Active' }); setEditingProjectIndex(null); }}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProjectSave}
              variant="contained"
              sx={{
                borderRadius: 3,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>


        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  © 2024 Bavadiya Realty LLP. All rights reserved.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Real Estate Payment Management System
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Version 1.0.0
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date().toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;