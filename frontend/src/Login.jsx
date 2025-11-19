import React, { useState, useContext } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Avatar
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://bavadiya-realty-backend.vercel.app/api/login', {
        username,
        password,
      });
      login(response.data.token);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Server responded with error status
        setError(err.response.data.error || 'Login failed');
      } else if (err.request) {
        // Network error
        setError('Network error - please check if backend is running');
      } else {
        // Other error
        setError('Invalid credentials');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 }
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 4,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          boxShadow: '0 40px 80px rgba(15,23,42,0.12)'
        }}
      >
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: { xs: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Bavadiya Realty LLP
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
              Real Estate Payment Management Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              • Single source of truth for brokerage performance
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              • Track payments, employees, and projects in one place
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              • Enterprise-grade access control and audit trails
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Need assistance? Contact admin@bavadiyarealty.com
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 4, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', mb: 2 }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Sign in to continue
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your administrator credentials to access the dashboard
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 1 }}>
              Sign In
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;