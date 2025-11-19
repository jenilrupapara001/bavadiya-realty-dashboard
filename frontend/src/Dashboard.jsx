
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
import UserSettings from './UserSettings';

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
      filtered = filtered.filter(item =>
        item.ownerReceivedBy === filterReceivedBy || item.customerReceivedBy === filterReceivedBy
      );
    }
    setFilteredData(filtered);
  }, [data, filterDateFrom, filterDateTo, filterEmployee, filterProject, filterStatus, filterReceivedBy, employees]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await axios.get('https://bavadiya-realty-backend.vercel.app/api/data', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError('Failed to load data. Please try again.');
      }
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
        ownerReceivedBy: '',
        customerBro: '',
        customerReceiveDate: '',
        customerReceivedBy: '',
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

  const formatINR = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('₹', '₹');
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
        const response = await axios.delete(`https://bavadiya-realty-backend.vercel.app/api/data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Delete response:', response.data);
        setSnackbar({ open: true, message: 'Entry deleted successfully!', severity: 'success' });
        fetchData();
      } catch (error) {
        console.error('Error deleting entry:', error);
        const errorMessage = error.response?.data?.message || 'Error deleting entry. Please try again.';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
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
    if (item.receiveDate) amount += (typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice)); // Owner brokerage if owner receive date filled
    if (item.customerReceiveDate) amount += (typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice)); // Customer brokerage if customer receive date filled
    return sum + amount;
  }, 0);

  const outstandingAmount = totalBrokerage - paymentReceived;

  const employeeData = data.reduce((acc, item) => {
    const emp = employees.find(e => e.code === item.employee);
    const empName = emp ? emp.name : item.employee;
    
    // Calculate total brokerage for this entry
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    const totalBrok = ownerBrok + customerBrok;
    
    // Calculate commission amount: (commission % * total brokerage) / 100
    const commissionAmount = ((item.commission || 0) * totalBrok) / 100;
    acc[empName] = (acc[empName] || 0) + commissionAmount;
    return acc;
  }, {});
  const chartData = Object.entries(employeeData).map(([name, value]) => ({ name, value }));

  const pieData = [
    { name: 'Received', value: paymentReceived, color: '#22c55e' }, // Green for received
    { name: 'Outstanding', value: outstandingAmount, color: '#ef4444' }, // Red for outstanding
  ];

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
    { text: 'Analytics Overview', icon: <BarChartIcon />, view: 'analytics' },
    { text: 'Payment Records', icon: <TableChart />, view: 'table' },
    { text: 'Project Management', icon: <TableChart />, view: 'projects' },
    { text: 'Employee Management', icon: <PersonIcon />, view: 'employees' },
    { text: 'User Settings', icon: <PersonIcon />, view: 'user-settings' },
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
        }} onDeleteEntry={handleDelete} />;
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
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 600 }}>
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
              </Box>
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
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 800 }}>
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
                </Box>
              </TableContainer>
            </Paper>
          </Container>
        );
case 'user-settings':
        return <UserSettings />;
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

                {/* Gradient Metric Cards */}
                <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
                  {[
                    {
                      title: 'Total Portfolio',
                      value: formatINR(totalPortfolio),
                      subtitle: 'Base Price • All transactions',
                      colors: ['#0f172a', '#2563eb']
                    },
                    {
                      title: 'Total Brokerage',
                      value: formatINR(totalBrokerage),
                      subtitle: 'Owner + Customer commissions',
                      colors: ['#1d4ed8', '#3b82f6']
                    },
                    {
                      title: 'Owner Brokerage',
                      value: formatINR(totalOwnerBrok),
                      subtitle: 'Owner commissions',
                      colors: ['#ea580c', '#f97316']
                    },
                    {
                      title: 'Customer Brokerage',
                      value: formatINR(totalCustomerBrok),
                      subtitle: 'Customer commissions',
                      colors: ['#7c3aed', '#a855f7']
                    },
                    {
                      title: 'Payment Received',
                      value: formatINR(paymentReceived),
                      subtitle: 'Based on receive dates',
                      colors: ['#047857', '#10b981']
                    },
                    {
                      title: 'Outstanding Amount',
                      value: formatINR(outstandingAmount),
                      subtitle: 'Pending payments',
                      colors: ['#b91c1c', '#ef4444']
                    }
                  ].map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={`${card.title}-${index}`}>
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5, md: 3 },
                          borderRadius: 4,
                          height: '100%',
                          minHeight: 150,
                          background: `linear-gradient(135deg, ${card.colors[0]} 0%, ${card.colors[1]} 100%)`,
                          color: '#fff',
                          boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Typography sx={{ fontSize: { xs: 12, md: 14 }, fontWeight: 500, opacity: 0.85 }}>
                          {card.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.3rem', md: '1.75rem' },
                            lineHeight: 1.2
                          }}
                        >
                          {card.value}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: 10, md: 12 }, opacity: 0.75 }}>
                          {card.subtitle}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Payment Status */}
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
                  Payment Status Analytics
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
                  {[
                    {
                      title: 'Received',
                      value: formatINR(paymentReceived),
                      subtitle: `${data.filter(item => item.receiveDate && item.customerReceiveDate).length} fully received`,
                      colors: ['#059669', '#34d399']
                    },
                    {
                      title: 'Outstanding',
                      value: formatINR(outstandingAmount),
                      subtitle: `${data.filter(item => !(item.receiveDate && item.customerReceiveDate)).length} pending payments`,
                      colors: ['#dc2626', '#f87171']
                    },
                    {
                      title: 'Owner Only',
                      value: formatINR(data.reduce((sum, item) => {
                        if (item.receiveDate && !item.customerReceiveDate) {
                          const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
                          return sum + ownerBrok;
                        }
                        return sum;
                      }, 0)),
                      subtitle: `${data.filter(item => item.receiveDate && !item.customerReceiveDate).length} owner received`,
                      colors: ['#ea580c', '#f97316']
                    },
                    {
                      title: 'Customer Only',
                      value: formatINR(data.reduce((sum, item) => {
                        if (!item.receiveDate && item.customerReceiveDate) {
                          const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
                          return sum + customerBrok;
                        }
                        return sum;
                      }, 0)),
                      subtitle: `${data.filter(item => !item.receiveDate && item.customerReceiveDate).length} customer received`,
                      colors: ['#9333ea', '#c084fc']
                    }
                  ].map(card => (
                    <Grid item xs={12} sm={6} md={3} key={card.title}>
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 4,
                          height: '100%',
                          background: `linear-gradient(135deg, ${card.colors[0]} 0%, ${card.colors[1]} 100%)`,
                          color: '#fff',
                          boxShadow: '0 15px 30px rgba(15, 23, 42, 0.2)'
                        }}
                      >
                        <Typography sx={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
                          {card.title}
                        </Typography>
                        <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.6rem' }, fontWeight: 700, my: 1 }}>
                          {card.value}
                        </Typography>
                        <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
                          {card.subtitle}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Analytics Overview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
                    Analytics Overview - Total Brokerage: {formatINR(totalBrokerage)}
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)'
                    }}
                  >
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
                    <Box sx={{ width: '100%', height: { xs: 280, md: 320 } }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{
                            top: 20,
                            right: 20,
                            left: 10,
                            bottom: 60
                          }}
                          barCategoryGap="20%"
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
                              fill: '#475569'
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
                              fill: '#475569'
                            }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                            width={60}
                          />
                          <Tooltip
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label) => `${label}`}
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.4)'
                            }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.15)' }}
                          />
                          <Bar
                            dataKey="value"
                            fill="#2563eb"
                            radius={[8, 8, 0, 0]}
                            animationBegin={0}
                            animationDuration={1000}
                            animationEasing="ease-out"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
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
                <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Filters
                  </Typography>
                  <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
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
                    <Grid item xs={12} sm={6} md={2}>
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
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl size="small" fullWidth>
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
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Project</InputLabel>
                        <Select
                          value={filterProject}
                          label="Project"
                          onChange={(e) => setFilterProject(e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          {projects.map((project) => (
                            <MenuItem key={project._id} value={project.name}>{project.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl size="small" fullWidth>
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
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl size="small" fullWidth>
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
                    minWidth: { xs: '800px', sm: '900px', md: '100%' }
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
                        <TableCell>Owner Received By</TableCell>
                        <TableCell>Customer Received By</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Employee</TableCell>
                        <TableCell>Commission (%)</TableCell>
                        <TableCell>Commission Amount (₹)</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell>Delete</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
{filteredData.slice(0, 10).map((row, index) => (
  <TableRow
    key={row._id || index}
    sx={{
      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
      '&:hover': { bgcolor: 'action.selected' },
      transition: 'background-color 0.2s ease'
    }}
  >
    <TableCell sx={{ fontWeight: 500 }}>{row.date || '-'}</TableCell>
    <TableCell>{row.unitNo || '-'}</TableCell>
    <TableCell>{row.projectName || '-'}</TableCell>
    <TableCell>{row.ownerName || '-'}</TableCell>
    <TableCell>{row.customerName || '-'}</TableCell>
    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
      {formatINR(row.basePrice || 0)}
    </TableCell>
    <TableCell>
      <Typography variant="body2" sx={{
        fontWeight: 500,
        color: row.ownerReceivedBy ? 'success.main' : 'text.secondary',
        fontSize: '0.875rem'
      }}>
        {row.ownerReceivedBy || '-'}
      </Typography>
    </TableCell>
    <TableCell>
      <Typography variant="body2" sx={{
        fontWeight: 500,
        color: row.customerReceivedBy ? 'success.main' : 'text.secondary',
        fontSize: '0.875rem'
      }}>
        {row.customerReceivedBy || '-'}
      </Typography>
    </TableCell>
    <TableCell>
      <Chip
        label={(row.receiveDate && row.customerReceiveDate) ? 'Received' : 'Pending'}
        color={(row.receiveDate && row.customerReceiveDate) ? 'success' : 'error'}
        size="small"
        variant="outlined"
        sx={{
          borderRadius: 2,
          '&.MuiChip-colorSuccess': {
            bgcolor: '#22c55e20',
            color: '#22c55e',
            borderColor: '#22c55e40'
          },
          '&.MuiChip-colorError': {
            bgcolor: '#ef444420',
            color: '#ef4444',
            borderColor: '#ef444440'
          }
        }}
      />
    </TableCell>
    <TableCell>{employees.find(e => e.code === row.employee)?.name || row.employee || '-'}</TableCell>
    <TableCell>{row.commission || 0}%</TableCell>
    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
      {/* Calculate commission based on total brokerage */}
      {(() => {
        const ownerBrok = typeof row.ownerBro === 'number' ? row.ownerBro : convertPercentageToAmount(row.ownerBro, row.basePrice);
        const customerBrok = typeof row.customerBro === 'number' ? row.customerBro : convertPercentageToAmount(row.customerBro, row.basePrice);
        const totalBrok = ownerBrok + customerBrok;
        return formatINR(((row.commission || 0) * totalBrok) / 100);
      })()}
    </TableCell>
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
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src="https://crm.bavadiyarealty.com/storage/uploads/logo/1754457837_logo.png"
              alt="Bavadiya Realty LLP"
              style={{ height: '40px', marginRight: '12px' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              Bavadiya Realty LLP
            </Typography>
          </Box>
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
        marginLeft: isMobile ? 0 : '280px',
        backgroundColor: '#F2F2F7',
        overflow: 'auto'
      }}>
        <Toolbar />
        <Box
          sx={{
            width: '100%',
            maxWidth: '100%',
            pt: { xs: 2, sm: 3, md: 4 },
            pb: 8,
            px: { xs: 2, sm: 3, md: 4 },
            mx: 'auto'
          }}
        >
          {renderView()}
        </Box>

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
                    {projects.map((project) => (
                      <MenuItem key={project._id} value={project.name}>{project.name}</MenuItem>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Commission Amount (₹)"
                  value={(() => {
                    const ownerBrok = typeof formData.ownerBro === 'number' ? formData.ownerBro : convertPercentageToAmount(formData.ownerBro, formData.basePrice);
                    const customerBrok = typeof formData.customerBro === 'number' ? formData.customerBro : convertPercentageToAmount(formData.customerBro, formData.basePrice);
                    const totalBrok = ownerBrok + customerBrok;
                    return formatINR(((formData.commission || 0) * totalBrok) / 100);
                  })()}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'grey.300'
                      }
                    }
                  }}
                  helperText="Auto-calculated based on total brokerage"
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