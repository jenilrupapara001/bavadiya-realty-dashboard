import React, { useState, useEffect, useContext } from 'react';
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
} from '@mui/material';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const Analytics = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ backend base URL (production)
  const API_BASE_URL = 'https://bavadiya-realty-backend.vercel.app';

  useEffect(() => {
    fetchData();
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
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
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

  // Received By Analytics
  const receivedByData = [
    {
      name: 'Dharmesh Bavadiya',
      ownerReceived: data.filter(item => item.ownerReceivedBy === 'Dharmesh Bavadiya').length,
      customerReceived: data.filter(item => item.customerReceivedBy === 'Dharmesh Bavadiya').length,
      amount: data.reduce((sum, item) => {
        let amount = 0;
        if (item.ownerReceivedBy === 'Dharmesh Bavadiya' && item.receiveDate) {
          amount += typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
        }
        if (item.customerReceivedBy === 'Dharmesh Bavadiya' && item.customerReceiveDate) {
          amount += typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
        }
        return sum + amount;
      }, 0)
    },
    {
      name: 'Yogesh Bavadiya',
      ownerReceived: data.filter(item => item.ownerReceivedBy === 'Yogesh Bavadiya').length,
      customerReceived: data.filter(item => item.customerReceivedBy === 'Yogesh Bavadiya').length,
      amount: data.reduce((sum, item) => {
        let amount = 0;
        if (item.ownerReceivedBy === 'Yogesh Bavadiya' && item.receiveDate) {
          amount += typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
        }
        if (item.customerReceivedBy === 'Yogesh Bavadiya' && item.customerReceiveDate) {
          amount += typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
        }
        return sum + amount;
      }, 0)
    },
    {
      name: 'Bavadiya Realty LLP',
      ownerReceived: data.filter(item => item.ownerReceivedBy === 'Bavadiya Realty LLP').length,
      customerReceived: data.filter(item => item.customerReceivedBy === 'Bavadiya Realty LLP').length,
      amount: data.reduce((sum, item) => {
        let amount = 0;
        if (item.ownerReceivedBy === 'Bavadiya Realty LLP' && item.receiveDate) {
          amount += typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
        }
        if (item.customerReceivedBy === 'Bavadiya Realty LLP' && item.customerReceiveDate) {
          amount += typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
        }
        return sum + amount;
      }, 0)
    }
  ];

  // Monthly trends (last 6 months)
  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = { month, total: 0, received: 0, brokerage: 0 };
    acc[month].total += item.basePrice || 0;
    
    // Calculate brokerage for this month
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    acc[month].brokerage += ownerBrok + customerBrok;
    
    if (item.receiveDate && item.customerReceiveDate) acc[month].received += item.basePrice || 0;
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData).slice(-6);

  // Employee performance with commission calculations
  const employeeData = data.reduce((acc, item) => {
    const empName = item.employee || 'Unknown';
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

  // Project distribution
  const projectData = data.reduce((acc, item) => {
    const project = item.projectName || 'Unknown';
    if (!acc[project]) acc[project] = { name: project, value: 0, brokerage: 0 };
    acc[project].value += item.basePrice || 0;
    
    // Calculate brokerage for this project
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    acc[project].brokerage += ownerBrok + customerBrok;
    return acc;
  }, {});
  const projectChartData = Object.values(projectData).slice(0, 8);

  // Status distribution
  const statusData = [
    {
      name: 'Fully Received',
      value: data.filter(item => item.receiveDate && item.customerReceiveDate).length,
      color: '#22c55e'
    },
    {
      name: 'Partially Received',
      value: data.filter(item => (item.receiveDate && !item.customerReceiveDate) || (!item.receiveDate && item.customerReceiveDate)).length,
      color: '#f59e0b'
    },
    {
      name: 'Pending',
      value: data.filter(item => !item.receiveDate && !item.customerReceiveDate).length,
      color: '#ef4444'
    }
  ];

  const COLORS = ['#1a365d', '#3b82f6', '#059669', '#d97706', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];

  // ---- UI ----
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6">Loading analytics...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 4 }}>
        Reports & Analytics
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a365d 0%, #3b82f6 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Total Portfolio</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(totalPayments)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Total Brokerage</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(totalBrokerage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Payment Received</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(paymentReceived)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Outstanding Amount</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(outstandingAmount)}
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
        {receivedByData.map((person, index) => (
          <Grid item xs={12} sm={6} md={4} key={person.name}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${COLORS[index]} 0%, ${COLORS[index]}dd 100%)`, 
              color: 'white', 
              borderRadius: 3, 
              minHeight: 160 
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 500, fontSize: { xs: '1rem', sm: '1.25rem' }, mb: 1 }}>
                  {person.name}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.75rem' }, mb: 1 }}>
                  {formatINR(person.amount)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Owner: ${person.ownerReceived}`} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }} 
                  />
                  <Chip 
                    label={`Customer: ${person.customerReceived}`} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 500 }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Monthly Trends */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Monthly Revenue & Brokerage Trends
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a365d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1a365d" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorBrokerage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `₹${formatINRNumber(value)}`, 
                    name === 'total' ? 'Total Revenue' : 'Total Brokerage'
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#1a365d" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} name="Total Revenue" />
                <Area type="monotone" dataKey="brokerage" stroke="#22c55e" fillOpacity={1} fill="url(#colorBrokerage)" strokeWidth={3} name="Brokerage" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} transactions`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2 }}>
              {statusData.map((entry, index) => (
                <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: entry.color, 
                    mr: 1 
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {entry.name}: {entry.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Project Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Revenue by Project
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(value) => [`₹${formatINRNumber(value)}`, 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Project Brokerage */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Brokerage by Project
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(value) => [`₹${formatINRNumber(value)}`, 'Brokerage']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="brokerage" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Employee Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Employee Performance (Revenue & Commission)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={employeeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `₹${formatINRNumber(value)}`,
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
