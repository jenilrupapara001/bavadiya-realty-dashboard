import React, { useState, useContext } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  ArrowForward,
  Business,
  VerifiedUser,
  AnalyticsOutlined,
  AdminPanelSettings
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from './AuthContext';
import { useCompany } from './CompanyContext';
import axios from 'axios';
import API_CONFIG from './config/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const { companyConfig } = useCompany();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(API_CONFIG.buildURL(API_CONFIG.endpoints.login), {
        username,
        password,
      });
      
      // Artificial delay for smooth transition
      setTimeout(() => {
        login(response.data.token);
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      setIsSubmitting(false);
      if (err.response) {
        setError(err.response.data.error || 'Invalid credentials');
      } else if (err.request) {
        setError('Connection error. Please check your network.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const featureItems = [
    { icon: <AnalyticsOutlined />, text: 'Real-time Portfolio Analytics' },
    { icon: <Business />, text: 'Complete Project Lifecycle Management' },
    { icon: <VerifiedUser />, text: 'Secure Payment Tracking & Audit' },
    { icon: <AdminPanelSettings />, text: 'Enterprise Role-based Access' }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(circle at 0% 0%, ${theme.palette.primary.light}20 0%, transparent 50%),
                    radial-gradient(circle at 100% 100%, ${theme.palette.secondary.light}20 0%, transparent 50%),
                    #f8fafc`
      }}
    >
      {/* Background Animated Blobs */}
      <Box
        component={motion.div}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}10 0%, transparent 70%)`,
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />
      <Box
        component={motion.div}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        sx={{
          position: 'absolute',
          bottom: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.secondary.main}10 0%, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '95vw',
            maxWidth: 1100,
            minHeight: 650,
            borderRadius: 8,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.1fr' },
            boxShadow: '0 40px 100px -20px rgba(15, 118, 110, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Left Side: Brand & Value Prop */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Subtle Texture Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.05,
                background: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
                pointerEvents: 'none'
              }}
            />

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Box sx={{ mb: 6 }}>
                <Typography variant="h3" sx={{ 
                  fontFamily: '"Cinzel", serif', 
                  fontWeight: 700, 
                  letterSpacing: '-0.02em',
                  mb: 1
                }}>
                  {companyConfig?.company?.name?.split(' ')[0] || 'Bavadiya'}
                  <Box component="span" sx={{ fontWeight: 400, ml: 1, opacity: 0.8 }}>
                    {companyConfig?.company?.name?.split(' ').slice(1).join(' ') || 'Realty LLP'}
                  </Box>
                </Typography>
                <Box sx={{ width: 60, height: 4, bgcolor: 'secondary.light', borderRadius: 2 }} />
              </Box>

              <Typography variant="h5" sx={{ mb: 4, fontWeight: 500, opacity: 0.9, lineHeight: 1.4 }}>
                Advanced Real Estate Management <br />
                & Financial Dashboard
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 6 }}>
                {featureItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'primary.light'
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>

            <Box sx={{ mt: 'auto', pt: 4 }}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 1 }}>
                SYSTEM STATUS
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981', animation: 'pulse 2s infinite' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
                  Operational • v2.0.0
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Side: Login Form */}
          <Box 
            sx={{ 
              p: { xs: 4, md: 8, lg: 10 }, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.4)'
            }}
          >
            <Box sx={{ mb: 5 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1.5 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Please sign in to your administrative account.
                </Typography>
              </motion.div>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined color="action" sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.08)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 8px 20px rgba(15, 118, 110, 0.12)'
                        }
                      }
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined color="action" sx={{ fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.08)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 8px 20px rgba(15, 118, 110, 0.12)'
                        }
                      }
                    }}
                  />
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert 
                        severity="error" 
                        variant="standard"
                        sx={{ 
                          borderRadius: 3,
                          bgcolor: 'rgba(239, 68, 68, 0.05)',
                          color: 'error.dark',
                          border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      height: 56,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-2px) scale(1.01)',
                        boxShadow: `0 20px 40px ${theme.palette.primary.main}30`
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <>
                        Secure Sign In
                        <ArrowForward sx={{ ml: 1, transition: 'transform 0.3s ease' }} className="arrow-icon" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </Box>
            </form>

            <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedUser sx={{ fontSize: 14 }} /> Secure SSL
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LockOutlined sx={{ fontSize: 14 }} /> AES-256
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Global CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
          .arrow-icon {
            transform: translateX(0);
          }
          button:hover .arrow-icon {
            transform: translateX(4px);
          }
        `}
      </style>
    </Box>
  );
};

export default Login;