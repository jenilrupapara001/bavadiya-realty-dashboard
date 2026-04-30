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
import API_CONFIG from './config/api';

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

  // Generate project entry numbers for better organization
  const generateProjectEntryNumbers = (data) => {
    const projectCounts = {};
    return data.map(item => {
      if (item.projectName) {
        projectCounts[item.projectName] = (projectCounts[item.projectName] || 0) + 1;
        return {
          ...item,
          entryNumber: projectCounts[item.projectName]
        };
      }
      return item;
    });
  };

  // Enhanced data with entry numbers
  const enhancedData = generateProjectEntryNumbers(data);

  useEffect(() => {
    fetchData();
    fetchEmployees();
    fetchProjects();
  }, []);

  useEffect(() => {
    filterData();
  }, [enhancedData, searchTerm, filterDateFrom, filterDateTo, filterEmployee, filterProject, filterStatus, filterReceivedBy]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.data), {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
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
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.employees), {
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
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.projects), {
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
    let filtered = enhancedData;

    // Show ALL entries - no filtering out based on payment status
    // This ensures all 5 entries for a project are visible

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
      <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6">Loading data table...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Typography variant="h6" color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        px: { xs: 2, sm: 3 }
      }}
    >
      <Typography variant="h4" sx={{ 
        fontWeight: 700, 
        color: 'primary.main', 
        mb: 4,
        fontFamily: 'Cinzel, serif',
        letterSpacing: '0.02em'
      }}>
        PAYMENT RECORDS
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        {[
          { label: 'Total Portfolio', value: formatINR(totalValue), color: 'primary.main', accent: '#2563eb' },
          { label: 'Total Brokerage', value: formatINR(totalBrokerage), color: 'secondary.main', accent: '#0f766e' },
          { label: 'Payment Received', value: formatINR(paymentReceived), color: '#16a34a', accent: '#16a34a' },
          { label: 'Outstanding Amount', value: formatINR(outstandingAmount), color: '#dc2626', accent: '#dc2626' }
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.05)',
                  borderColor: 'primary.light'
                }
              }}
            >
              <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1 }}>
                {card.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: card.color, letterSpacing: '-0.02em' }}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters - Responsive */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 }, 
        mb: { xs: 2, md: 3 }, 
        borderRadius: 2 
      }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            mb: { xs: 2, sm: 2 }
          }}
        >
          Filters
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} lg={3}>
            <TextField
              label="From Date"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <TextField
              label="To Date"
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 2 },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Employee</InputLabel>
              <Select
                value={filterEmployee}
                label="Employee"
                onChange={(e) => setFilterEmployee(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
                  '& .MuiSelect-select': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                }}
              >
                <MenuItem value="">All</MenuItem>
                {employees.map((emp, index) => (
                  <MenuItem key={index} value={emp.name}>{emp.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Project</InputLabel>
              <Select
                value={filterProject}
                label="Project"
                onChange={(e) => setFilterProject(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
                  '& .MuiSelect-select': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                }}
              >
                <MenuItem value="">All</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project.name}>{project.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={1}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
                  '& .MuiSelect-select': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={1}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Received By</InputLabel>
              <Select
                value={filterReceivedBy}
                label="Received By"
                onChange={(e) => setFilterReceivedBy(e.target.value)}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiInputLabel-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
                  '& .MuiSelect-select': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                }}
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
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: '#ffffff',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.03)'
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip 
            label={`Total Entries: ${totalEntries}`} 
            color="primary" 
            variant="soft" 
            sx={{ fontWeight: 600, bgcolor: 'primary.light', color: 'primary.main', border: 'none' }}
          />
          <Chip 
            label={`Value: ${formatINR(totalValue)}`} 
            sx={{ fontWeight: 600, bgcolor: 'secondary.light', color: 'secondary.main', border: 'none' }}
          />
          <Chip 
            label={`Pending: ${filteredData.filter(item => !(item.receiveDate && item.customerReceiveDate)).length}`} 
            sx={{ fontWeight: 600, bgcolor: 'warning.light', color: 'warning.dark', border: 'none' }}
          />
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
<<<<<<< HEAD
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Unit No</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Project</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Base Price</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Owner RecBy</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Cust RecBy</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Comm (%)</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Comm Amt</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'grey.50', fontSize: '0.85rem' }}>Actions</TableCell>
              </TableRow>
=======
                <TableRow sx={{
                  bgcolor: 'primary.main',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  '& th': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    px: { xs: 1, sm: 1.5, md: 2 },
                    py: { xs: 1, sm: 1.5 }
                  }
                }}>
                  <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>Entry #</TableCell>
                  <TableCell sx={{ minWidth: { xs: '80px', sm: '100px' } }}>Date</TableCell>
                  <TableCell sx={{ minWidth: { xs: '80px', sm: '100px' } }}>Unit No</TableCell>
                  <TableCell sx={{ minWidth: { xs: '120px', sm: '150px' } }}>Project</TableCell>
                  <TableCell sx={{ minWidth: { xs: '100px', sm: '120px' } }}>Owner</TableCell>
                  <TableCell sx={{ minWidth: { xs: '100px', sm: '120px' } }}>Customer</TableCell>
                  <TableCell sx={{ minWidth: { xs: '120px', sm: '140px' } }}>Base Price</TableCell>
                  <TableCell sx={{ minWidth: { xs: '130px', sm: '150px' } }}>Owner Received By</TableCell>
                  <TableCell sx={{ minWidth: { xs: '140px', sm: '160px' } }}>Customer Received By</TableCell>
                  <TableCell sx={{ minWidth: { xs: '80px', sm: '100px' } }}>Status</TableCell>
                  <TableCell sx={{ minWidth: { xs: '100px', sm: '120px' } }}>Employee</TableCell>
                  <TableCell sx={{ minWidth: { xs: '80px', sm: '100px' } }}>Commission (%)</TableCell>
                  <TableCell sx={{ minWidth: { xs: '140px', sm: '160px' } }}>Commission Amount</TableCell>
                  <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>Actions</TableCell>
                  <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>Delete</TableCell>
                </TableRow>
>>>>>>> 0d83de8fb6a1a6e4f70a13a7b176f8aa20423c71
            </TableHead>
            <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row._id || index}
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                      '&:hover': { bgcolor: 'action.selected' },
                      transition: 'background-color 0.2s ease',
                      '& td': {
                        px: { xs: 0.5, sm: 1, md: 1.5 },
                        py: { xs: 0.75, sm: 1 },
                        fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' }
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{row.entryNumber || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{row.date || '-'}</TableCell>
                    <TableCell>{row.unitNo || '-'}</TableCell>
                    <TableCell sx={{ 
                      maxWidth: { xs: '120px', sm: '150px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {row.projectName ? `${row.projectName} #${row.entryNumber}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      maxWidth: { xs: '100px', sm: '120px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.ownerName || '-'}
                    </TableCell>
                    <TableCell sx={{ 
                      maxWidth: { xs: '100px', sm: '120px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.customerName || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatINR(row.basePrice || 0)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        color: row.ownerReceivedBy ? 'success.main' : 'text.secondary',
                        fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                        maxWidth: { xs: '130px', sm: '150px' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {row.ownerReceivedBy || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        color: row.customerReceivedBy ? 'success.main' : 'text.secondary',
                        fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                        maxWidth: { xs: '140px', sm: '160px' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
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
                          fontSize: { xs: '0.5rem', sm: '0.625rem', md: '0.75rem' },
                          height: { xs: '20px', sm: '24px' },
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
                    <TableCell sx={{ 
                      maxWidth: { xs: '100px', sm: '120px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.employee || '-'}
                    </TableCell>
                    <TableCell>{row.commission || 0}%</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
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
                          borderRadius: 2,
                          p: { xs: 0.5, sm: 1 }
                        }}
                        size="small"
                      >
                        <Edit fontSize="small" />
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
                          borderRadius: 2,
                          p: { xs: 0.5, sm: 1 }
                        }}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </Box>

        {/* Responsive Pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            mt: 2
          }}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </Typography>
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DataTable;
