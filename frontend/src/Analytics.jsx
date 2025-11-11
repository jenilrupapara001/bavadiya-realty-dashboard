import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/data', {
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

  // Calculate analytics data
  const totalPayments = data.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  const receivedPayments = data.filter(item => item.receiveDate).reduce((sum, item) => sum + (item.basePrice || 0), 0);
  const pendingPayments = totalPayments - receivedPayments;

  // Monthly trends (last 6 months)
  const monthlyData = data.reduce((acc, item) => {
    const month = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) acc[month] = { month, total: 0, received: 0 };
    acc[month].total += item.basePrice || 0;
    if (item.receiveDate) acc[month].received += item.basePrice || 0;
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData).slice(-6);

  // Employee performance
  const employeeData = data.reduce((acc, item) => {
    if (!acc[item.employee]) acc[item.employee] = { name: item.employee, deals: 0, revenue: 0 };
    acc[item.employee].deals += 1;
    acc[item.employee].revenue += item.basePrice || 0;
    return acc;
  }, {});

  const employeeChartData = Object.values(employeeData).sort((a, b) => b.revenue - a.revenue);

  // Project types distribution
  const projectData = data.reduce((acc, item) => {
    const project = item.projectName || 'Unknown';
    if (!acc[project]) acc[project] = { name: project, value: 0 };
    acc[project].value += item.basePrice || 0;
    return acc;
  }, {});

  const projectChartData = Object.values(projectData).slice(0, 8); // Top 8 projects

  const COLORS = ['#1a365d', '#3b82f6', '#059669', '#d97706', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'];

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
          <Typography variant="h6" color="error">{error}</Typography>
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
          <Card sx={{ background: 'linear-gradient(135deg, #1a365d 0%, #3b82f6 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Total Revenue</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{totalPayments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Received</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{receivedPayments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ₹{pendingPayments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', color: 'white' }}>
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
          <Paper sx={{ p: 3, height: '100%' }}>
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
          <Paper sx={{ p: 3, height: '100%' }}>
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
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Employee Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#1a365d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;