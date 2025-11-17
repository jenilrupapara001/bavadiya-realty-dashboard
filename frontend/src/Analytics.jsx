import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Heading,
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
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
  const receivedPayments = data
    .filter(item => item.receiveDate)
    .reduce((sum, item) => sum + (item.basePrice || 0), 0);
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
      <Container maxW="container.xl" mt={4}>
        <Box display="flex" justifyContent="center" alignItems="center" h="400px">
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" mt={4}>
        <Box display="flex" justifyContent="center" alignItems="center" h="400px">
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl">
      <Heading size="lg" mb={6} color="blue.600">
        Reports & Analytics
      </Heading>

      {/* Key Metrics */}
      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} mb={8}>
        <Card bg="blue.500" color="white" borderRadius="xl" shadow="lg">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2}>Total Revenue</Heading>
            <Text fontSize="2xl" fontWeight="bold">
              ₹{totalPayments.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card bg="green.500" color="white" borderRadius="xl" shadow="lg">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2}>Received</Heading>
            <Text fontSize="2xl" fontWeight="bold">
              ₹{receivedPayments.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card bg="orange.500" color="white" borderRadius="xl" shadow="lg">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2}>Pending</Heading>
            <Text fontSize="2xl" fontWeight="bold">
              ₹{pendingPayments.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card bg="purple.500" color="white" borderRadius="xl" shadow="lg">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2}>Total Deals</Heading>
            <Text fontSize="2xl" fontWeight="bold">
              {data.length}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      {/* Charts */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        {/* Monthly Trends */}
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Card borderRadius="xl" shadow="md">
            <CardHeader>
              <Heading size="md">Monthly Revenue Trends</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="total" stroke="#1a365d" strokeWidth={3} name="Total" />
                    <Line type="monotone" dataKey="received" stroke="#059669" strokeWidth={3} name="Received" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        {/* Project Distribution */}
        <GridItem>
          <Card borderRadius="xl" shadow="md">
            <CardHeader>
              <Heading size="md">Revenue by Project</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                <ResponsiveContainer width="100%" height="100%">
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
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        {/* Employee Performance */}
        <GridItem colSpan={3}>
          <Card borderRadius="xl" shadow="md">
            <CardHeader>
              <Heading size="md">Employee Performance</Heading>
            </CardHeader>
            <CardBody>
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="blue.500" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Analytics;
