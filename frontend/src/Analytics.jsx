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
  ResponsiveContainer, PieChart, Pie, Cell
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
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(`Failed to load analytics data: ${error.message}`);
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

  const COLORS = ['#1a365d', '#3b82f6', '#059669', '#d97706', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];

  // Ensure we have valid data arrays to prevent crashes
  const safeProjectChartData = Array.isArray(projectChartData) ? projectChartData : [];
  const safeEmployeeChartData = Array.isArray(employeeChartData) ? employeeChartData : [];
  const safeReceivedByData = Array.isArray(receivedByData) ? receivedByData : [];

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
          ))
        )}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Project Distribution - Donut Chart */}
        <Grid item xs={12} lg={12}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Revenue by Project
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={safeProjectChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {safeProjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${formatINRNumber(value)}`, 'Revenue']}
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
              {safeProjectChartData.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No project data available
                </Typography>
              ) : (
                safeProjectChartData.slice(0, 8).map((entry, index) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: COLORS[index % COLORS.length],
                      mr: 1
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {entry.name}: {formatINR(entry.value)}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
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
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
