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
} from '@mui/material';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ backend base URL (production)
  const API_BASE_URL = 'https://bavadiya-realty-backend.vercel.app';

  useEffect(() => {
    fetchData();
  }, []);

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

  // Monthly trends (last 6 months)
  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = { month, total: 0, received: 0 };
    acc[month].total += item.basePrice || 0;
    if (item.receiveDate) acc[month].received += item.basePrice || 0;
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
    if (!acc[project]) acc[project] = { name: project, value: 0 };
    acc[project].value += item.basePrice || 0;
    return acc;
  }, {});
  const projectChartData = Object.values(projectData).slice(0, 8);

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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a365d 0%, #3b82f6 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Total Brokerage</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{totalBrokerage.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Received</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{paymentReceived.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Outstanding</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{outstandingAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Total Deals</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {data.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Monthly Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Monthly Revenue Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                <Line type="monotone" dataKey="total" stroke="#1a365d" strokeWidth={3} name="Total" />
                <Line type="monotone" dataKey="received" stroke="#059669" strokeWidth={3} name="Received" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Project Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Revenue by Project
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                >
                  {projectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Employee Performance */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Employee Performance (Revenue & Commission)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${value.toLocaleString()}`,
                    name === 'revenue' ? 'Total Revenue' : 'Commission'
                  ]}
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
