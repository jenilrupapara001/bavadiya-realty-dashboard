import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme } from './theme';

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
      <Router>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
