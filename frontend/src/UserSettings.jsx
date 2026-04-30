import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Avatar,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Person,
  Security,
  People,
  Add,
  Delete,
  CheckCircle,
  Cancel as CancelIcon,
  History
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import API_CONFIG from './config/api';
import Audit from './Audit';

const UserSettings = () => {
  const { logout } = React.useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [auditLogs, setAuditLogs] = useState([]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    username: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Add user dialog state
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'User'
  });

  useEffect(() => {
    fetchCurrentUser();
    if (activeTab === 2) {
      fetchUsers();
    }
  }, [activeTab]);



  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.profile), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setCurrentUser(response.data);
      setProfileData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        role: response.data.role || 'User',
        username: response.data.username || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.users), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_CONFIG.buildURL(`${API_CONFIG.endpoints.users}/${currentUser._id}`), profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('Profile updated successfully!');
      fetchCurrentUser(); // Refresh user data
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        API_CONFIG.buildURL(`${API_CONFIG.endpoints.users}/${currentUser._id}/password`),
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_CONFIG.buildURL(API_CONFIG.endpoints.users), newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('User created successfully!');
      setAddUserOpen(false);
      setNewUserData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'User'
      });
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_CONFIG.buildURL(`${API_CONFIG.endpoints.users}/${userId}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setSuccess('User deactivated successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Error deactivating user:', error);
        setError(error.response?.data?.error || 'Failed to deactivate user');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-settings-tabpanel-${index}`}
      aria-labelledby={`user-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const accountHighlights = [
    { label: 'Role', value: profileData.role || 'User' },
    { label: 'Username', value: profileData.username || '—' },
    { label: 'Email', value: profileData.email || 'Not set' }
  ];

  return (
    <Box
      component="section"
      sx={{ maxWidth: '1400px', mx: 'auto', py: 4 }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 4,
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.03)'
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 1, 
            color: 'primary.main',
            fontFamily: 'Cinzel, serif',
            letterSpacing: '0.02em'
          }}>
            SYSTEM SETTINGS
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Control access, update your profile, and manage the team in one workspace.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {accountHighlights.map((item) => (
            <Chip
              key={item.label}
              label={`${item.label}: ${item.value}`}
              variant="soft"
              sx={{ 
                fontWeight: 600, 
                bgcolor: 'primary.light', 
                color: 'primary.main',
                border: 'none'
              }}
            />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', borderRadius: 4, p: { xs: 1, md: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="user settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem'
              }
            }}
          >
            <Tab icon={<Person />} label="Profile Settings" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<People />} label="User Management" />
            <Tab icon={<History />} label="Audit Logs" />
          </Tabs>
        </Box>

        {/* Profile Settings Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  textAlign: 'center', 
                  borderRadius: 4, 
                  p: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Avatar
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : <Person />}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profileData.fullName || 'User Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {profileData.email || 'email@example.com'}
                </Typography>
                <Chip 
                  label={profileData.role || 'User'} 
                  color="primary" 
                  variant="outlined"
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ borderRadius: 4, p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Personal Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.fullName}
                      onChange={(e) => {
                        setProfileData(prevData => ({...prevData, fullName: e.target.value}));
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        setProfileData(prevData => ({...prevData, email: e.target.value}));
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => {
                        setProfileData(prevData => ({...prevData, phone: e.target.value}));
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profileData.username}
                      disabled
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        sx={{ borderRadius: 2 }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => fetchCurrentUser()}
                        sx={{ borderRadius: 2 }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8}>
              <Paper sx={{ borderRadius: 4, p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Ensure your account is using a long, random password to stay secure.
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData(prevData => ({...prevData, currentPassword: e.target.value}));
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            >
                              {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData(prevData => ({...prevData, newPassword: e.target.value}));
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            >
                              {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData(prevData => ({...prevData, confirmPassword: e.target.value}));
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            >
                              {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<Security />}
                      onClick={handlePasswordChange}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                      sx={{ borderRadius: 2 }}
                    >
                      Change Password
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={activeTab} index={2}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: '#ffffff'
            }}
          >
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Team Members
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Invite admins and manage user permissions.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddUserOpen(true)}
                sx={{ 
                  borderRadius: 2, 
                  fontWeight: 600,
                  px: 3,
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Add Member
              </Button>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Member</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Username</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Last Login</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'grey.50' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                            {user.fullName.charAt(0).toUpperCase()}
                          </Avatar>
                          {user.fullName}
                        </Box>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'Admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          icon={user.isActive ? <CheckCircle /> : <CancelIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleDeactivateUser(user._id)}
                          sx={{ color: 'error.main' }}
                          disabled={!user.isActive}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Paper>
        </TabPanel>

        {/* Audit Logs Tab */}
        <TabPanel value={activeTab} index={3}>
          <Audit />
        </TabPanel>
      </Paper>

      {/* Add User Dialog */}
      <Dialog
        open={addUserOpen}
        onClose={() => setAddUserOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={newUserData.username}
                onChange={(e) => {
                  setNewUserData(prevData => ({...prevData, username: e.target.value}));
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUserData.password}
                onChange={(e) => {
                  setNewUserData(prevData => ({...prevData, password: e.target.value}));
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={newUserData.fullName}
                onChange={(e) => {
                  setNewUserData(prevData => ({...prevData, fullName: e.target.value}));
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => {
                  setNewUserData(prevData => ({...prevData, email: e.target.value}));
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newUserData.phone}
                onChange={(e) => {
                  setNewUserData(prevData => ({...prevData, phone: e.target.value}));
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUserData.role}
                  label="Role"
                  onChange={(e) => {
                    setNewUserData(prevData => ({...prevData, role: e.target.value}));
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setAddUserOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddUser}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserSettings;