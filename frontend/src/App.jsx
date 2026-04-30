import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import { CompanyProvider } from './CompanyContext';
import Login from './Login';
import Dashboard from './Dashboard';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme } from './theme';
import { GlobalStyles } from '@mui/material';

const globalStyles = (
  <GlobalStyles
    styles={{
      '@import': [
        "url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap')"
      ],
      'html, body': {
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#F0FDFA',
        backgroundAttachment: 'fixed',
        fontFamily: '"Josefin Sans", sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*': {
        boxSizing: 'border-box',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: 'rgba(15, 118, 110, 0.05)',
      },
      '::-webkit-scrollbar-thumb': {
        background: 'rgba(15, 118, 110, 0.2)',
        borderRadius: '10px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(15, 118, 110, 0.3)',
      },
    }}
  />
);


function MainApp() {
  const { token } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={token ? <Dashboard /> : <Navigate to="/" replace />}
      />
      {/* Catch all route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      {globalStyles}
      <Router>
        <AuthProvider>
          <CompanyProvider>
            <MainApp />
          </CompanyProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
