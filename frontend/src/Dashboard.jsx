
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
  Skeleton,
  Fade,
  Grow,
} from '@mui/material';
import { Logout, Add, Edit, Dashboard as DashboardIcon, BarChart as BarChartIcon, TableChart, Menu, Person as PersonIcon } from '@mui/icons-material';
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
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    code: '',
    number: '',
  });
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);
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
    customerBro: '',
    customerReceiveDate: '',
    employee: '',
    commission: '',
  });

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, []);

  useEffect(() => {
    let filtered = data;
    if (filterDate) {
      filtered = filtered.filter(item => item.receiveDate === filterDate);
    }
    if (filterEmployee) {
      filtered = filtered.filter(item => item.employee === filterEmployee);
    }
    if (filterProject) {
      filtered = filtered.filter(item => item.projectName === filterProject);
    }
    setFilteredData(filtered);
  }, [data, filterDate, filterEmployee, filterProject, employees]);

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
    setOpen(false);
  };

  const handleSave = async () => {
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

  const totalPortfolio = data.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  const totalBrokerage = data.reduce((sum, item) => sum + (item.ownerBro || 0) + (item.customerBro || 0), 0);
  const totalOwnerBrok = data.reduce((sum, item) => sum + (item.ownerBro || 0), 0);
  const totalCustomerBrok = data.reduce((sum, item) => sum + (item.customerBro || 0), 0);
  const paymentReceived = data.filter(item => item.receiveDate).reduce((sum, item) => sum + (item.ownerBro || 0) + (item.customerBro || 0), 0);
  const outstandingAmount = totalBrokerage - paymentReceived;

  const employeeData = data.reduce((acc, item) => {
    const emp = employees.find(e => e.code === item.employee);
    const empName = emp ? emp.name : item.employee;
    acc[empName] = (acc[empName] || 0) + (item.basePrice || 0);
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
    { text: 'Employee Management', icon: <PersonIcon />, view: 'employees' },
    { text: 'Account Settings', icon: <PersonIcon />, view: 'settings' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'analytics':
        return <Analytics />;
      case 'table':
        return <DataTable onEditEntry={(row) => handleOpen(data.indexOf(row))} />;
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
      case 'settings':
        return (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 4 }}>
              Account Settings
            </Typography>
            <Typography>Account settings coming soon...</Typography>
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
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                  <Grid item xs={6} sm={6} md={2}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(0, 122, 255, 0.2)',
                      minHeight: { xs: 120, sm: 140 },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '80px', sm: '120px' },
                        height: { xs: '80px', sm: '120px' },
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                      }
                    }}>
                      <CardContent sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: { xs: 1.5, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          Total Portfolio (Base Price)
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          ₹{totalPortfolio.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          All transactions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={6} md={2}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(52, 199, 89, 0.2)',
                      minHeight: { xs: 120, sm: 140 },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '80px', sm: '120px' },
                        height: { xs: '80px', sm: '120px' },
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                      }
                    }}>
                      <CardContent sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: { xs: 1.5, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          Total Brokerage
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          ₹{totalBrokerage.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          Owner + Customer
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={6} md={2}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(255, 149, 0, 0.2)',
                      minHeight: { xs: 120, sm: 140 },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '80px', sm: '120px' },
                        height: { xs: '80px', sm: '120px' },
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                      }
                    }}>
                      <CardContent sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: { xs: 1.5, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          Owner Total Brokerage
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          ₹{totalOwnerBrok.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          Owner commissions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={6} md={2}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #AF52DE 0%, #BF5AF2 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(175, 82, 222, 0.2)',
                      minHeight: { xs: 120, sm: 140 },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '80px', sm: '120px' },
                        height: { xs: '80px', sm: '120px' },
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                      }
                    }}>
                      <CardContent sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: { xs: 1.5, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          Customer Total Brokerage
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          ₹{totalCustomerBrok.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          Customer commissions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={6} md={2}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(0, 122, 255, 0.2)',
                      minHeight: { xs: 120, sm: 140 },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '80px', sm: '120px' },
                        height: { xs: '80px', sm: '120px' },
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                      }
                    }}>
                      <CardContent sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: { xs: 1.5, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          Payment Received
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          ₹{paymentReceived.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          Based on receive date
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={6} md={2}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 4,
                      boxShadow: '0 4px 16px rgba(255, 59, 48, 0.2)',
                      minHeight: { xs: 120, sm: 140 },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: { xs: '80px', sm: '120px' },
                        height: { xs: '80px', sm: '120px' },
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        transform: 'translate(30px, -30px)',
                      }
                    }}>
                      <CardContent sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: { xs: 1.5, sm: 2 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          Outstanding Amount
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            mb: 0.5,
                            lineHeight: 1.2
                          }}
                        >
                          ₹{outstandingAmount.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.8,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                          }}
                        >
                          Based on receive date
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
                    <Grid item xs={12} md={3}>
                      <TextField
                        label="Date Range"
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
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
                    <Grid item xs={12} md={3}>
                      <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }} size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="received">Received</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
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
                            <IconButton onClick={() => handleOpen(row._id)} sx={{ borderRadius: 2 }}>
                              <Edit />
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
                  label="Owner Name"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner Number"
                  value={formData.ownerNumber}
                  onChange={(e) => setFormData({ ...formData, ownerNumber: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Number"
                  value={formData.customerNumber}
                  onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Time Period"
                  value={formData.timePeriod}
                  onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base Price"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || '' })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner Brokerage"
                  type="number"
                  value={formData.ownerBro}
                  onChange={(e) => setFormData({ ...formData, ownerBro: parseFloat(e.target.value) || '' })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Receive Date"
                  type="date"
                  value={formData.receiveDate}
                  onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Brokerage"
                  type="number"
                  value={formData.customerBro}
                  onChange={(e) => setFormData({ ...formData, customerBro: parseFloat(e.target.value) || '' })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Receive Date"
                  type="date"
                  value={formData.customerReceiveDate}
                  onChange={(e) => setFormData({ ...formData, customerReceiveDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
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