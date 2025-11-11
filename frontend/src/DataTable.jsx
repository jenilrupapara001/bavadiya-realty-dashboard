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
import { Search, FilterList, Edit, Add } from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const DataTable = ({ onEditEntry }) => {
  const { logout } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, searchTerm, statusFilter, employeeFilter]);

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

  const filterData = () => {
    let filtered = data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'received') {
        filtered = filtered.filter(item => item.receiveDate);
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(item => !item.receiveDate);
      }
    }

    // Employee filter
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(item => item.employee === employeeFilter);
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
  const receivedCount = filteredData.filter(item => item.receiveDate).length;
  const receivedValue = filteredData.filter(item => item.receiveDate).reduce((sum, item) => sum + (item.basePrice || 0), 0);
  const pendingValue = totalValue - receivedValue;

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const employees = [...new Set(data.map(item => item.employee).filter(Boolean))];

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
        Data Table
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Total Entries</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalEntries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Total Value</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                ₹{totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Received</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                ₹{receivedValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                ₹{pendingValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Filters & Search
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={employeeFilter}
                label="Employee"
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <MenuItem value="all">All Employees</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp} value={emp}>{emp}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setEmployeeFilter('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
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
                <TableCell>Actions</TableCell>
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
                    ₹{row.basePrice?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.receiveDate ? 'Received' : 'Pending'}
                      color={row.receiveDate ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{row.employee}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => onEditEntry && onEditEntry(row)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white'
                        }
                      }}
                    >
                      <Edit />
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
