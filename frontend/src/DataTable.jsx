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
  Chip,
  IconButton,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Search, FilterList, Edit, Add, Delete } from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const DataTable = ({ onEditEntry, onDeleteEntry }) => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReceivedBy, setFilterReceivedBy] = useState('');
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
    fetchEmployees();
    fetchProjects();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, searchTerm, filterDateFrom, filterDateTo, filterEmployee, filterProject, filterStatus, filterReceivedBy]);

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

  const filterData = () => {
    let filtered = data;

    // Hide payments where both payments are received
    filtered = filtered.filter(item => !(item.receiveDate && item.customerReceiveDate));

    // Date filters
    if (filterDateFrom || filterDateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date); // Use date field like Dashboard
        const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
        const toDate = filterDateTo ? new Date(filterDateTo) : null;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Employee filter - match Dashboard logic
    if (filterEmployee) {
      filtered = filtered.filter(item => item.employee === filterEmployee);
    }

    // Project filter
    if (filterProject) {
      filtered = filtered.filter(item => item.projectName === filterProject);
    }

    // Status filter
    if (filterStatus) {
      if (filterStatus === 'received') {
        filtered = filtered.filter(item => item.receiveDate && item.customerReceiveDate);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(item => !item.receiveDate || !item.customerReceiveDate);
      }
    }

    // Received By filter
    if (filterReceivedBy) {
      filtered = filtered.filter(item =>
        item.ownerReceivedBy === filterReceivedBy || item.customerReceivedBy === filterReceivedBy
      );
    }

    setFilteredData(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate summary statistics
  const totalEntries = filteredData.length;
  const totalValue = filteredData.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  
  // Calculate brokerage breakdown
  const totalBrokerage = filteredData.reduce((sum, item) => {
    const ownerBrok = typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice);
    const customerBrok = typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice);
    return sum + ownerBrok + customerBrok;
  }, 0);

  // Payment received based on receive dates
  const paymentReceived = filteredData.reduce((sum, item) => {
    let amount = 0;
    if (item.receiveDate) amount += (typeof item.ownerBro === 'number' ? item.ownerBro : convertPercentageToAmount(item.ownerBro, item.basePrice));
    if (item.customerReceiveDate) amount += (typeof item.customerBro === 'number' ? item.customerBro : convertPercentageToAmount(item.customerBro, item.basePrice));
    return sum + amount;
  }, 0);

  const outstandingAmount = totalBrokerage - paymentReceived;

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6">Loading data table...</Typography>
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 4 }}>
        Payment Records
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Total Portfolio</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Total Brokerage</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(totalBrokerage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 140 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Payment Received</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {formatINR(paymentReceived)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters - Match Dashboard */}
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
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project.name}>{project.name}</MenuItem>
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

      {/* Data Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'auto' }}>
        <TableContainer>
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
                <TableCell>Commission Amount (₹)</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
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
                    {formatINR(row.basePrice || 0)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.receiveDate && row.customerReceiveDate ? 'Received' : 'Pending'}
                      color={row.receiveDate && row.customerReceiveDate ? 'success' : 'error'}
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
                  <TableCell>{row.employee}</TableCell>
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
                      onClick={() => onEditEntry && onEditEntry(row)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white'
                        },
                        borderRadius: 2
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => onDeleteEntry && onDeleteEntry(row._id)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white'
                        },
                        borderRadius: 2
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

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Container>
  );
};

export default DataTable;
