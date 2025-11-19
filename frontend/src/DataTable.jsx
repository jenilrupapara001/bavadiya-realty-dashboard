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
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }

      const response = await axios.get('https://bavadiya-realty-backend.vercel.app/api/data', {
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: { xs: 2, sm: 3, md: 4 }, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
        Payment Records
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {[
          { label: 'Total Portfolio', value: formatINR(totalValue), color: 'primary.main' },
          { label: 'Total Brokerage', value: formatINR(totalBrokerage), color: 'success.main' },
          { label: 'Payment Received', value: formatINR(paymentReceived), color: '#16a34a' },
          { label: 'Outstanding Amount', value: formatINR(outstandingAmount), color: '#dc2626' }
        ].map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.label}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, height: '100%' }}>
              <Typography sx={{ fontSize: { xs: 11, sm: 12 }, color: 'text.secondary', fontWeight: 600 }}>
                {card.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: card.color, mt: 0.5 }}>
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
        borderRadius: 3 
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
                  <MenuItem key={index} value={emp.code}>{emp.name}</MenuItem>
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
                <MenuItem value="Dharmesh Bavadiya">Dharmesh</MenuItem>
                <MenuItem value="Yogesh Bavadiya">Yogesh</MenuItem>
                <MenuItem value="Bavadiya Realty LLP">Company</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table - Responsive */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: { xs: 1.5, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`Entries: ${totalEntries}`} variant="outlined" />
          <Chip label={`Value: ${formatINR(totalValue)}`} color="success" variant="outlined" />
          <Chip label={`Pending: ${filteredData.filter(item => !(item.receiveDate && item.customerReceiveDate)).length}`} color="warning" variant="outlined" />
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: { xs: 900, md: '100%' } }}>
            <TableHead>
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
                    <TableCell sx={{ fontWeight: 500 }}>{row.date || '-'}</TableCell>
                    <TableCell>{row.unitNo || '-'}</TableCell>
                    <TableCell sx={{ 
                      maxWidth: { xs: '120px', sm: '150px' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.projectName || '-'}
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
