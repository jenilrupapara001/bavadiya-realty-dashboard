import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Heading,
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  IconButton,
  Grid,
  GridItem,
  Card,
  CardBody,
  useToast,
  Spinner,
  Alert,
} from '@chakra-ui/react';
import { SearchIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const DataTable = ({ onEditEntry }) => {
  const { logout } = useContext(AuthContext);
  const toast = useToast();
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
      toast({
        title: 'Error loading data',
        description: 'Failed to load data. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" mt={4} mb={4}>
      <Heading size="lg" mb={6} color="blue.600">
        Payment Records
      </Heading>

      {/* Summary Cards */}
      <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} mb={8}>
        <Card borderRadius="xl" shadow="md">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2} color="gray.600">Total Entries</Heading>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {totalEntries}
            </Text>
          </CardBody>
        </Card>
        <Card borderRadius="xl" shadow="md">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2} color="gray.600">Total Value</Heading>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              ₹{totalValue.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card borderRadius="xl" shadow="md">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2} color="gray.600">Received</Heading>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              ₹{receivedValue.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
        <Card borderRadius="xl" shadow="md">
          <CardBody textAlign="center">
            <Heading size="sm" mb={2} color="gray.600">Pending</Heading>
            <Text fontSize="2xl" fontWeight="bold" color="orange.600">
              ₹{pendingValue.toLocaleString()}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      {/* Filters */}
      <Card borderRadius="xl" shadow="md" mb={6}>
        <CardBody>
          <Heading size="sm" mb={4}>
            Filters & Search
          </Heading>
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} alignItems="end">
            <Box>
              <InputGroup>
                <InputLeftElement>
                  <SearchIcon />
                </InputLeftElement>
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Box>
            <Box>
              <Select
                placeholder="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
              </Select>
            </Box>
            <Box>
              <Select
                placeholder="Employee"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              >
                <option value="all">All Employees</option>
                {employees.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
              </Select>
            </Box>
            <Box>
              <Button
                leftIcon={<SearchIcon />}
                variant="outline"
                w="full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setEmployeeFilter('all');
                }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {/* Data Table */}
      <Card borderRadius="xl" shadow="md">
        <CardBody p={0}>
          <Table variant="simple">
            <Thead>
              <Tr bg="blue.500">
                <Th color="white">Date</Th>
                <Th color="white">Unit No</Th>
                <Th color="white">Project</Th>
                <Th color="white">Owner</Th>
                <Th color="white">Customer</Th>
                <Th color="white">Base Price</Th>
                <Th color="white">Status</Th>
                <Th color="white">Employee</Th>
                <Th color="white">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedData.map((row, index) => (
                <Tr key={row.id || index} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">{row.date}</Td>
                  <Td>{row.unitNo}</Td>
                  <Td>{row.projectName}</Td>
                  <Td>{row.ownerName}</Td>
                  <Td>{row.customerName}</Td>
                  <Td fontWeight="bold" color="blue.600">
                    ₹{row.basePrice?.toLocaleString()}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={row.receiveDate ? 'green' : 'orange'}
                    >
                      {row.receiveDate ? 'Received' : 'Pending'}
                    </Badge>
                  </Td>
                  <Td>{row.employee}</Td>
                  <Td>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={() => onEditEntry && onEditEntry(row)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Container>
  );
};

export default DataTable;
