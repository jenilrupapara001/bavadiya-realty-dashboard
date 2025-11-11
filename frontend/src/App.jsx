import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme, darkTheme } from './theme';

function MainApp() {
  const { token } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> : <Navigate to="/" replace />}
        />
        {/* Catch all route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}
