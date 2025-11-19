import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Label
} from 'recharts';

const Analytics = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectMetric, setSelectedProjectMetric] = useState('totalBrokerage');
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);
  const [employees, setEmployees] = useState([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ backend base URL (production)
  const API_BASE_URL = 'https://bavadiya-realty-backend.vercel.app';

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter data: only show records where both payments are NOT received
    const filtered = data.filter(item => !(item.receiveDate && item.customerReceiveDate));
    setFilteredData(filtered);
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(`Failed to load analytics data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE_URL}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // ---- ANALYTICS CALCULATIONS ----
  const totalPayments = data.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  
  // Calculate total brokerage (owner + customer)
  const convertPercentageToAmount = (percentage, basePrice) => {
    if (!percentage || !basePrice) return 0;
    return (parseFloat(percentage) / 100) * parseFloat(basePrice);
  };

  const formatINR = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatINRNumber = (amount) => {
    if (!amount) return 0;
    return new Intl.NumberFormat('en-IN').format(amount);
  };
  
  const totalBrokerage = data.reduce((sum, item) => {
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    return sum + ownerBrok + customerBrok;
  }, 0);

  // Payment received based on receive dates
  const paymentReceived = data.reduce((sum, item) => {
    let amount = 0;
    if (item.receiveDate) amount += (typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice));
    if (item.customerReceiveDate) amount += (typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice));
    return sum + amount;
  }, 0);

  const outstandingAmount = totalBrokerage - paymentReceived;

  // Received By Analytics - Dynamic based on actual data
  const getReceivedByData = () => {
    const receivedByMap = new Map();
    
    data.forEach(item => {
      // Process owner received by
      if (item.ownerReceivedBy && item.receiveDate) {
        const key = item.ownerReceivedBy;
        if (!receivedByMap.has(key)) {
          receivedByMap.set(key, { name: key, ownerReceived: 0, customerReceived: 0, amount: 0 });
        }
        const entry = receivedByMap.get(key);
        entry.ownerReceived++;
        const ownerAmount = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
        entry.amount += ownerAmount;
      }
      
      // Process customer received by
      if (item.customerReceivedBy && item.customerReceiveDate) {
        const key = item.customerReceivedBy;
        if (!receivedByMap.has(key)) {
          receivedByMap.set(key, { name: key, ownerReceived: 0, customerReceived: 0, amount: 0 });
        }
        const entry = receivedByMap.get(key);
        entry.customerReceived++;
        const customerAmount = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
        entry.amount += customerAmount;
      }
    });
    
    return Array.from(receivedByMap.values()).sort((a, b) => b.amount - a.amount);
  };
  
  const receivedByData = getReceivedByData();

  // Employee performance with commission calculations
  const employeeLookup = useMemo(() => {
    const map = new Map();
    employees.forEach(emp => {
      if (emp?.code) {
        map.set(emp.code, emp.name || emp.code);
      }
      if (emp?._id) {
        map.set(emp._id, emp.name || emp.code || emp._id);
      }
    });
    return map;
  }, [employees]);

  const employeeData = data.reduce((acc, item) => {
    const employeeCode = item.employee || 'Unknown';
    const empName = employeeLookup.get(employeeCode) || employeeLookup.get(item.employeeName) || item.employeeName || employeeCode || 'Unknown';
    if (!acc[empName]) acc[empName] = { name: empName, deals: 0, revenue: 0, commission: 0 };
    acc[empName].deals += 1;
    acc[empName].revenue += item.basePrice || 0;
    
    // Calculate total brokerage for this entry
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    const totalBrok = ownerBrok + customerBrok;
    
    // Calculate commission based on total brokerage
    acc[empName].commission += ((item.commission || 0) * totalBrok / 100);
    return acc;
  }, {});
  const employeeChartData = Object.values(employeeData).sort((a, b) => b.revenue - a.revenue);

  // Project distribution with multiple metrics
  const projectData = data.reduce((acc, item) => {
    const project = item.projectName || 'Unknown';
    if (!acc[project]) {
      acc[project] = { 
        name: project, 
        basePrice: 0, 
        totalBrokerage: 0,
        receivedAmount: 0,
        deals: 0,
        employee: item.employee || 'Unknown'
      };
    }
    acc[project].basePrice += item.basePrice || 0;
    acc[project].deals += 1;
    
    // Calculate total brokerage for this project
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    acc[project].totalBrokerage += ownerBrok + customerBrok;
    
    // Calculate received amount
    let receivedAmount = 0;
    if (item.receiveDate) receivedAmount += ownerBrok;
    if (item.customerReceiveDate) receivedAmount += customerBrok;
    acc[project].receivedAmount += receivedAmount;
    
    return acc;
  }, {});
  
  // Create different chart data options
  const projectChartDataByBasePrice = Object.values(projectData)
    .map(item => ({ name: item.name, value: item.basePrice, totalBrokerage: item.totalBrokerage, deals: item.deals }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
    
  const projectChartDataByBrokerage = Object.values(projectData)
    .map(item => ({ name: item.name, value: item.totalBrokerage, basePrice: item.basePrice, deals: item.deals }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
    
  const projectChartDataByReceived = Object.values(projectData)
    .map(item => ({ name: item.name, value: item.receivedAmount, basePrice: item.basePrice, totalBrokerage: item.totalBrokerage, deals: item.deals }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const COLORS = ['#1a365d', '#3b82f6', '#059669', '#d97706', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];

  // Get current chart data based on selected metric
  const getCurrentProjectData = () => {
    switch (selectedProjectMetric) {
      case 'basePrice':
        return projectChartDataByBasePrice;
      case 'totalBrokerage':
        return projectChartDataByBrokerage;
      case 'receivedAmount':
        return projectChartDataByReceived;
      default:
        return projectChartDataByBrokerage;
    }
  };

  // Get metric label and description
  const getMetricInfo = () => {
    switch (selectedProjectMetric) {
      case 'basePrice':
        return { label: 'Property Value', description: 'Total base price of properties in each project' };
      case 'totalBrokerage':
        return { label: 'Total Brokerage', description: 'Total brokerage amount earned from each project' };
      case 'receivedAmount':
        return { label: 'Received Amount', description: 'Total amount actually received from each project' };
      default:
        return { label: 'Total Brokerage', description: 'Total brokerage amount earned from each project' };
    }
  };

  const currentProjectData = getCurrentProjectData();
  const metricInfo = getMetricInfo();

  // Calculate total for percentage calculations
  const getTotalForMetric = () => {
    switch (selectedProjectMetric) {
      case 'basePrice':
        return totalPayments;
      case 'totalBrokerage':
        return totalBrokerage;
      case 'receivedAmount':
        return paymentReceived;
      default:
        return totalBrokerage;
    }
  };

  const totalForMetric = getTotalForMetric();

  const chartHeight = useMemo(() => {
    if (isSmallScreen) return 320;
    if (isMediumScreen) return 360;
    return 420;
  }, [isSmallScreen, isMediumScreen]);

  const activeSlice = activeProjectIndex !== null ? safeProjectChartData[activeProjectIndex] : null;

  const renderProjectTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0].payload;
    const percentage = totalForMetric ? ((entry.value / totalForMetric) * 100).toFixed(1) : 0;
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0px 8px 20px rgba(15, 23, 42, 0.12)',
          bgcolor: 'background.paper',
          minWidth: 200
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>
          {entry.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{metricInfo.label}: {formatINR(entry.value)}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Deals: {entry.deals}</Typography>
        {entry.basePrice !== undefined && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Property Value: {formatINR(entry.basePrice)}
          </Typography>
        )}
        {entry.totalBrokerage !== undefined && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Total Brokerage: {formatINR(entry.totalBrokerage)}
          </Typography>
        )}
        {entry.receivedAmount !== undefined && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Received: {formatINR(entry.receivedAmount)}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: 'text.primary' }}>
          {percentage}% of total
        </Typography>
      </Box>
    );
  };

  const renderCenterLabel = ({ viewBox }) => {
    if (!viewBox || !viewBox.cx || !viewBox.cy) return null;
    const { cx, cy } = viewBox;
    const entry = activeSlice;
    const value = entry ? entry.value : totalForMetric;
    const percentage = entry && totalForMetric ? ((entry.value / totalForMetric) * 100).toFixed(1) : 100;
    const title = entry ? entry.name : 'Total';

    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
        <tspan x={cx} y={cy - 10} fill="#6b7280" fontSize={12}>
          {entry ? metricInfo.label : 'Overall'}
        </tspan>
        <tspan
          x={cx}
          y={cy + 10}
          fill="#0f172a"
          fontSize={isSmallScreen ? 16 : 18}
          fontWeight="600"
        >
          {formatINR(value)}
        </tspan>
        {entry && (
          <tspan x={cx} y={cy + 30} fill="#94a3b8" fontSize={12}>
            {title} • {percentage}%
          </tspan>
        )}
      </text>
    );
  };

  // Ensure we have valid data arrays to prevent crashes
  const safeProjectChartData = Array.isArray(currentProjectData) ? currentProjectData : [];
  const safeEmployeeChartData = Array.isArray(employeeChartData) ? employeeChartData : [];
  const safeReceivedByData = Array.isArray(receivedByData) ? receivedByData : [];

  // ---- UI ----
  if (loading) {
    return (
      <Container
        maxWidth="xl"
        disableGutters
        sx={{ px: { xs: 2, sm: 3, md: 3 }, py: { xs: 2, sm: 3, md: 4 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6">Loading analytics...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="xl"
        disableGutters
        sx={{ px: { xs: 2, sm: 3, md: 3 }, py: { xs: 2, sm: 3, md: 4 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{ px: { xs: 2, sm: 3, md: 3 }, py: { xs: 2, sm: 3, md: 4 } }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 4 }}>
        Reports & Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a365d 0%, #3b82f6 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Total Portfolio</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(totalPayments)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Total Brokerage</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(totalBrokerage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Payment Received</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(paymentReceived)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Outstanding Amount</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(outstandingAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Status Cards */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
        Payment Status Analytics
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Received</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(paymentReceived)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {data.filter(item => item.receiveDate && item.customerReceiveDate).length} fully received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Outstanding</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(outstandingAmount)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {data.filter(item => !(item.receiveDate && item.customerReceiveDate)).length} pending payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Owner Only</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(data.reduce((sum, item) => {
                  if (item.receiveDate && !item.customerReceiveDate) {
                    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
                    return sum + ownerBrok;
                  }
                  return sum;
                }, 0))}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {data.filter(item => item.receiveDate && !item.customerReceiveDate).length} owner received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Customer Only</Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {formatINR(data.reduce((sum, item) => {
                  if (!item.receiveDate && item.customerReceiveDate) {
                    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
                    return sum + customerBrok;
                  }
                  return sum;
                }, 0))}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                {data.filter(item => !item.receiveDate && item.customerReceiveDate).length} customer received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Received By Cards */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', mb: 3 }}>
        Received By Analytics
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        {safeReceivedByData.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No payment records with received amounts found. Add payment records to see analytics.
            </Alert>
          </Grid>
        ) : (
          safeReceivedByData.map((person, index) => (
            <Grid item xs={12} sm={6} md={4} key={person.name}>
              <Card sx={{
                background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[index % COLORS.length]}dd 100%)`,
                color: 'white',
                borderRadius: 3,
                minHeight: 160
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1 }}>
                    {person.name}
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.75rem' }, 
                    mb: 1,
                    wordBreak: 'break-word',
                    lineHeight: 1.2
                  }}>
                    {formatINR(person.amount)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Owner: ${person.ownerReceived}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                    />
                    <Chip
                      label={`Customer: ${person.customerReceived}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500, fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Project Distribution - Enhanced Horizontal Bar Chart */}
        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Project Analytics
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>View by</InputLabel>
                <Select
                  value={selectedProjectMetric}
                  label="View by"
                  onChange={(e) => setSelectedProjectMetric(e.target.value)}
                >
                  <MenuItem value="totalBrokerage">Total Brokerage</MenuItem>
                  <MenuItem value="basePrice">Property Value</MenuItem>
                  <MenuItem value="receivedAmount">Received Amount</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {metricInfo.description}
            </Typography>

            {safeProjectChartData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body2" color="text.secondary">
                  No project data available
                </Typography>
              </Box>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <PieChart>
                    <Pie
                      data={safeProjectChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={safeProjectChartData.length > 6 ? 1.5 : 3}
                      cx="50%"
                      cy="50%"
                      onMouseEnter={(_, index) => setActiveProjectIndex(index)}
                      onMouseLeave={() => setActiveProjectIndex(null)}
                      cursor="pointer"
                      activeIndex={activeProjectIndex}
                    >
                      {safeProjectChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={activeProjectIndex === index ? 3 : 1}
                          opacity={activeProjectIndex === null || activeProjectIndex === index ? 1 : 0.45}
                        />
                      ))}
                      <Label content={renderCenterLabel} />
                    </Pie>
                    <Tooltip
                      content={renderProjectTooltip}
                      wrapperStyle={{
                        outline: 'none',
                        border: 'none',
                        filter: 'drop-shadow(0px 8px 24px rgba(15,23,42,0.12))'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {activeSlice && (
                  <Box
                    sx={{
                      display: { xs: 'flex', md: 'none' },
                      flexDirection: 'column',
                      alignItems: 'center',
                      mt: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {activeSlice.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metricInfo.label}: {formatINR(activeSlice.value)} ({((activeSlice.value / totalForMetric) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    mt: 3,
                    justifyContent: { xs: 'center', md: 'flex-start' }
                  }}
                >
                  {safeProjectChartData.map((entry, index) => {
                    const percentage = totalForMetric ? ((entry.value / totalForMetric) * 100).toFixed(1) : 0;
                    return (
                      <Box
                        key={entry.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: activeProjectIndex === index ? 'primary.main' : 'grey.200',
                          backgroundColor: activeProjectIndex === index ? 'primary.light' : 'background.paper',
                          minWidth: { xs: '45%', sm: 'auto' }
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: COLORS[index % COLORS.length],
                            flexShrink: 0
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                            {entry.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {percentage}% • {formatINR(entry.value)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
            
            {/* Enhanced Project Summary Table */}
            {safeProjectChartData.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Project Summary ({metricInfo.label})
                </Typography>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Box sx={{ minWidth: 640 }}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                      gap: 1,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Project Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Deals
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Property Value
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {metricInfo.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        % of Total
                      </Typography>
                    </Box>
                    {safeProjectChartData.map((entry, index) => {
                      const percentage = ((entry.value / totalForMetric) * 100).toFixed(1);
                      return (
                        <Box
                          key={entry.name}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                            gap: 1,
                            p: 1.5,
                            borderBottom: '1px solid',
                            borderColor: 'grey.100',
                            '&:last-of-type': { borderBottom: 'none' },
                            alignItems: 'center'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: COLORS[index % COLORS.length],
                              mr: 1,
                              flexShrink: 0
                            }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                              {entry.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {entry.deals}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {formatINR(entry.basePrice)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {formatINR(entry.value)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                            {percentage}%
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                
                {/* Summary Statistics */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Total Projects: {safeProjectChartData.length}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Total Deals: {safeProjectChartData.reduce((sum, item) => sum + item.deals, 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {metricInfo.label}: {formatINR(totalForMetric)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Employee Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Employee Performance (Revenue & Commission)
            </Typography>
            {safeEmployeeChartData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body2" color="text.secondary">
                  No employee performance data available
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={safeEmployeeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => {
                    if (value >= 10000000) {
                      return `₹${(value / 10000000).toFixed(1)}Cr`;
                    } else if (value >= 100000) {
                      return `₹${(value / 100000).toFixed(1)}L`;
                    } else {
                      return `₹${formatINRNumber(value)}`;
                    }
                  }} />
                  <Tooltip
                    formatter={(value, name) => [
                      formatINR(value),
                      name === 'revenue' ? 'Total Revenue' : 'Commission Earned'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#1a365d" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="commission" fill="#22c55e" name="Commission" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
