import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  List,
  ListItem,
  ListIcon,
  Divider,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Spinner,
  Alert,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  ViewIcon,
  DeleteIcon,
  HamburgerIcon,
  LogoutIcon,
  DashboardIcon,
  BarChartIcon,
  TableIcon,
  PersonIcon,
} from '@chakra-ui/icons';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Analytics from './Analytics';
import DataTable from './DataTable';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: drawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: modalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: employeeModalOpen, onOpen: onEmployeeModalOpen, onClose: onEmployeeModalClose } = useDisclosure();
  const toast = useToast();

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReceivedBy, setFilterReceivedBy] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    code: '',
    number: '',
  });
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    unitNo: '',
    projectName: '',
    ownerName: '',
    ownerNumber: '',
    customerName: '',
    customerNumber: '',
    timePeriod: '',
    basePrice: '',
    ownerBro: '',
    receiveDate: '',
    customerBro: '',
    customerReceiveDate: '',
    employee: '',
    commission: '',
  });

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterData();
  }, [data, filterDate, filterEmployee, filterProject, filterStatus, filterReceivedBy]);

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

  const filterData = () => {
    let filtered = data;

    if (filterDate) {
      filtered = filtered.filter(item => item.receiveDate === filterDate);
    }
    if (filterEmployee) {
      filtered = filtered.filter(item => item.employee === filterEmployee);
    }
    if (filterProject) {
      filtered = filtered.filter(item => item.projectName === filterProject);
    }
    if (filterStatus) {
      if (filterStatus === 'received') {
        filtered = filtered.filter(item => item.receiveDate && item.customerReceiveDate);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(item => !item.receiveDate || !item.customerReceiveDate);
      }
    }
    if (filterReceivedBy) {
      filtered = filtered.filter(item => item.employee === filterReceivedBy);
    }

    setFilteredData(filtered);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingIndex !== null) {
        await axios.put(`https://bavadiya-realty-backend.vercel.app/api/data/${editingIndex}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: 'Entry updated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post('https://bavadiya-realty-backend.vercel.app/api/data', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: 'Entry added successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      fetchData();
      onModalClose();
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: 'Error saving entry. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEmployeeSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (editingEmployeeIndex !== null) {
        await axios.put(`https://bavadiya-realty-backend.vercel.app/api/employees/${editingEmployeeIndex}`, employeeFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: 'Employee updated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post('https://bavadiya-realty-backend.vercel.app/api/employees', employeeFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: 'Employee added successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      fetchEmployees();
      onEmployeeModalClose();
      setEmployeeFormData({ name: '', code: '', number: '' });
      setEditingEmployeeIndex(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: 'Error saving employee. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calculations
  const totalPortfolio = data.reduce((sum, item) => sum + (item.basePrice || 0), 0);
  const totalBrokerage = data.reduce((sum, item) => sum + (item.ownerBro || 0) + (item.customerBro || 0), 0);
  const totalOwnerBrok = data.reduce((sum, item) => sum + (item.ownerBro || 0), 0);
  const totalCustomerBrok = data.reduce((sum, item) => sum + (item.customerBro || 0), 0);
  const paymentReceived = data.filter(item => item.receiveDate).reduce((sum, item) => sum + (item.ownerBro || 0) + (item.customerBro || 0), 0);
  const outstandingAmount = totalBrokerage - paymentReceived;

  const employeeData = data.reduce((acc, item) => {
    const emp = employees.find(e => e.code === item.employee);
    const empName = emp ? emp.name : item.employee;
    acc[empName] = (acc[empName] || 0) + (item.basePrice || 0);
    return acc;
  }, {});
  const chartData = Object.entries(employeeData).map(([name, value]) => ({ name, value }));

  const pieData = [
    { name: 'Received', value: paymentReceived, color: '#059669' },
    { name: 'Outstanding', value: outstandingAmount, color: '#d97706' },
  ];

  const menuItems = [
    { text: 'Dashboard', icon: DashboardIcon, view: 'dashboard' },
    { text: 'Analytics Overview', icon: BarChartIcon, view: 'analytics' },
    { text: 'Payment Records', icon: TableIcon, view: 'table' },
    { text: 'Project Management', icon: ViewIcon, view: 'projects' },
    { text: 'Employee Management', icon: PersonIcon, view: 'employees' },
    { text: 'Account Settings', icon: PersonIcon, view: 'settings' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'analytics':
        return <Analytics />;
      case 'table':
        return <DataTable onEditEntry={(row) => {
          setFormData(row);
          setEditingIndex(row._id);
          onModalOpen();
        }} />;
      case 'employees':
        return (
          <Container maxW="container.xl">
            <Heading size="lg" mb={6} color="blue.600">
              Employee Management
            </Heading>
            <Flex justify="flex-end" mb={4}>
              <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={onEmployeeModalOpen}>
                Add Employee
              </Button>
            </Flex>
            <Card borderRadius="xl" shadow="md">
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead>
                    <Tr bg="blue.500">
                      <Th color="white">Name</Th>
                      <Th color="white">Code</Th>
                      <Th color="white">Number</Th>
                      <Th color="white">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {employees.map((emp, index) => (
                      <Tr key={index}>
                        <Td>{emp.name}</Td>
                        <Td>{emp.code}</Td>
                        <Td>{emp.number}</Td>
                        <Td>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => {
                              setEmployeeFormData(emp);
                              setEditingEmployeeIndex(emp._id);
                              onEmployeeModalOpen();
                            }}
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
      case 'settings':
        return (
          <Container maxW="container.xl">
            <Heading size="lg" mb={6} color="blue.600">
              Account Settings
            </Heading>
            <Text>Account settings coming soon...</Text>
          </Container>
        );
      case 'projects':
        return (
          <Container maxW="container.xl">
            <Heading size="lg" mb={6} color="blue.600">
              Project Management
            </Heading>
            <Text>Project management coming soon...</Text>
          </Container>
        );
      case 'dashboard':
      default:
        return (
          <>
            {loading && (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" />
              </Flex>
            )}
            {error && (
              <Alert status="error" mb={4}>
                {error}
              </Alert>
            )}
            {!loading && !error && (
              <>
                {/* Welcome Header */}
                <Box mb={6}>
                  <Heading size="lg" color="blue.600" mb={2}>
                    Welcome to Bavadiya Realty LLP
                  </Heading>
                  <Text color="gray.600">
                    Real Estate Payment Management Dashboard
                  </Text>
                </Box>

                {/* Cards On Dashboard */}
                <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }} gap={4} mb={8}>
                  <GridItem>
                    <Card bg="blue.500" color="white" borderRadius="xl" shadow="lg">
                      <CardBody textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Total Portfolio (Base Price)
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₹{totalPortfolio.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          All transactions
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card bg="green.500" color="white" borderRadius="xl" shadow="lg">
                      <CardBody textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Total Brokerage
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₹{totalBrokerage.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Owner + Customer
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card bg="teal.500" color="white" borderRadius="xl" shadow="lg">
                      <CardBody textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Owner Total Brokerage
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₹{totalOwnerBrok.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Owner commissions
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card bg="purple.500" color="white" borderRadius="xl" shadow="lg">
                      <CardBody textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Customer Total Brokerage
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₹{totalCustomerBrok.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Customer commissions
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card bg="orange.500" color="white" borderRadius="xl" shadow="lg">
                      <CardBody textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Payment Received
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₹{paymentReceived.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Based on receive date
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem>
                    <Card bg="red.500" color="white" borderRadius="xl" shadow="lg">
                      <CardBody textAlign="center">
                        <Text fontSize="sm" fontWeight="bold" mb={1}>
                          Outstanding Amount
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold">
                          ₹{outstandingAmount.toLocaleString()}
                        </Text>
                        <Text fontSize="xs" opacity={0.8}>
                          Based on receive date
                        </Text>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>

                {/* Analytics Overview */}
                <Box mb={8}>
                  <Heading size="md" mb={4} color="gray.700">
                    Analytics Overview (All based on Total Brokerage)
                  </Heading>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    <Card borderRadius="xl" shadow="md">
                      <CardHeader>
                        <Heading size="md">Payments by Employee</Heading>
                      </CardHeader>
                      <CardBody>
                        <Box h="300px">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                              <Bar dataKey="value" fill="blue.500" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardBody>
                    </Card>
                    <Card borderRadius="xl" shadow="md">
                      <CardHeader>
                        <Heading size="md">Payment Status Distribution</Heading>
                      </CardHeader>
                      <CardBody>
                        <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                innerRadius={40}
                                dataKey="value"
                                stroke="#fff"
                                strokeWidth={2}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardBody>
                    </Card>
                  </Grid>
                </Box>

                {/* Payment Records */}
                <Flex justify="space-between" align="center" mb={4} direction={{ base: 'column', md: 'row' }}>
                  <Heading size="md" mb={{ base: 2, md: 0 }}>
                    Payment Records
                  </Heading>
                  <Button
                    colorScheme="blue"
                    leftIcon={<AddIcon />}
                    onClick={onModalOpen}
                    size="lg"
                  >
                    Add New Entry
                  </Button>
                </Flex>

                {/* Filters */}
                <Card borderRadius="xl" shadow="md" mb={4}>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      Filters
                    </Heading>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(5, 1fr)' }} gap={4}>
                      <FormControl>
                        <FormLabel>Date Range</FormLabel>
                        <Input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Employee Name</FormLabel>
                        <Select
                          value={filterEmployee}
                          onChange={(e) => setFilterEmployee(e.target.value)}
                        >
                          <option value="">All</option>
                          {employees.map((emp) => (
                            <option key={emp.code} value={emp.code}>{emp.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Project</FormLabel>
                        <Select
                          value={filterProject}
                          onChange={(e) => setFilterProject(e.target.value)}
                        >
                          <option value="">All</option>
                          {[...new Set(data.map(item => item.projectName))].map(proj => (
                            <option key={proj} value={proj}>{proj}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="">All</option>
                          <option value="received">Received</option>
                          <option value="pending">Pending</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Received By</FormLabel>
                        <Select
                          value={filterReceivedBy}
                          onChange={(e) => setFilterReceivedBy(e.target.value)}
                        >
                          <option value="">All</option>
                          {employees.map((emp) => (
                            <option key={emp.code} value={emp.code}>{emp.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </CardBody>
                </Card>

                {/* Table */}
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
                          <Th color="white">Commission</Th>
                          <Th color="white">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredData.map((row, index) => (
                          <Tr key={index} _hover={{ bg: 'gray.50' }}>
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
                                colorScheme={
                                  row.receiveDate && row.customerReceiveDate ? 'green' :
                                  row.customerReceiveDate ? 'yellow' : 'red'
                                }
                              >
                                {row.receiveDate && row.customerReceiveDate ? 'Received' :
                                 row.customerReceiveDate ? 'Partial' : 'Pending'}
                              </Badge>
                            </Td>
                            <Td>{employees.find(e => e.code === row.employee)?.name || row.employee}</Td>
                            <Td>{row.commission}%</Td>
                            <Td>
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => {
                                  setFormData(row);
                                  setEditingIndex(row._id);
                                  onModalOpen();
                                }}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </>
            )}
          </>
        );
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Flex
        as="header"
        bg="blue.500"
        color="white"
        p={4}
        align="center"
        justify="space-between"
        shadow="lg"
      >
        <Flex align="center">
          {isMobile && (
            <IconButton
              icon={<HamburgerIcon />}
              onClick={onDrawerOpen}
              mr={4}
              color="white"
              variant="ghost"
            />
          )}
          <Heading size="md">Bavadiya Realty LLP</Heading>
        </Flex>
        <HStack>
          <IconButton
            icon={<LogoutIcon />}
            onClick={logout}
            color="white"
            variant="ghost"
          />
        </HStack>
      </Flex>

      <Flex>
        {/* Sidebar */}
        <Drawer
          isOpen={drawerOpen}
          placement="left"
          onClose={onDrawerClose}
          size="xs"
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerHeader bg="blue.500" color="white">
              <Heading size="md">Dashboard</Heading>
              <Text fontSize="sm">Realty Management</Text>
            </DrawerHeader>
            <DrawerBody>
              <VStack align="stretch" spacing={2}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    leftIcon={React.createElement(item.icon)}
                    variant={activeView === item.view ? 'solid' : 'ghost'}
                    colorScheme={activeView === item.view ? 'blue' : 'gray'}
                    justifyContent="flex-start"
                    onClick={() => {
                      setActiveView(item.view);
                      onDrawerClose();
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box flex="1" p={6}>
          <Container maxW="container.xl">
            {renderView()}
          </Container>
        </Box>
      </Flex>

      {/* Input Form Modal */}
      <Modal isOpen={modalOpen} onClose={onModalClose} size="6xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="blue.500" color="white" borderTopRadius="2xl">
            {editingIndex !== null ? 'Edit Payment Entry' : 'Add New Payment Entry'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            <Text mb={4} color="gray.600">
              All fields are required except Receive Date and Owner/Customer Brokerage.
            </Text>
            <VStack spacing={4}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Unit No</FormLabel>
                  <Input
                    value={formData.unitNo}
                    onChange={(e) => setFormData({ ...formData, unitNo: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Project Name</FormLabel>
                  <Select
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  >
                    <option value="">Select Project</option>
                    {[...new Set(data.map(item => item.projectName))].map(proj => (
                      <option key={proj} value={proj}>{proj}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Owner Name</FormLabel>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Owner Number</FormLabel>
                  <Input
                    value={formData.ownerNumber}
                    onChange={(e) => setFormData({ ...formData, ownerNumber: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Customer Name</FormLabel>
                  <Input
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Customer Number</FormLabel>
                  <Input
                    value={formData.customerNumber}
                    onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Time Period</FormLabel>
                  <Input
                    value={formData.timePeriod}
                    onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Base Price</FormLabel>
                  <Input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || '' })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Owner Brokerage</FormLabel>
                  <Input
                    type="number"
                    value={formData.ownerBro}
                    onChange={(e) => setFormData({ ...formData, ownerBro: parseFloat(e.target.value) || '' })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Receive Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.receiveDate}
                    onChange={(e) => setFormData({ ...formData, receiveDate: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Customer Brokerage</FormLabel>
                  <Input
                    type="number"
                    value={formData.customerBro}
                    onChange={(e) => setFormData({ ...formData, customerBro: parseFloat(e.target.value) || '' })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Customer Receive Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.customerReceiveDate}
                    onChange={(e) => setFormData({ ...formData, customerReceiveDate: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.code} value={emp.code}>{emp.name} ({emp.code})</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Employee Commission (%)</FormLabel>
                  <Input
                    type="number"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || '' })}
                  />
                </FormControl>
              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              Save Entry
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Employee Modal */}
      <Modal isOpen={employeeModalOpen} onClose={onEmployeeModalClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader bg="blue.500" color="white" borderTopRadius="2xl">
            {editingEmployeeIndex !== null ? 'Edit Employee' : 'Add New Employee'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Employee Name</FormLabel>
                <Input
                  value={employeeFormData.name}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, name: e.target.value })}
                />
              </FormControl>
              <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Employee Code</FormLabel>
                  <Input
                    value={employeeFormData.code}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, code: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Employee Number</FormLabel>
                  <Input
                    value={employeeFormData.number}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, number: e.target.value })}
                  />
                </FormControl>
              </Grid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEmployeeModalClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleEmployeeSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Footer */}
      <Box as="footer" bg="gray.100" p={4} mt={8}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" wrap="wrap">
            <Box>
              <Text fontSize="sm" color="gray.600">
                © 2024 Bavadiya Realty LLP. All rights reserved.
              </Text>
              <Text fontSize="xs" color="gray.600">
                Real Estate Payment Management System
              </Text>
            </Box>
            <HStack>
              <Text fontSize="xs" color="gray.600">Version 1.0.0</Text>
              <Text fontSize="xs" color="gray.600">
                Last updated: {new Date().toLocaleDateString()}
              </Text>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;