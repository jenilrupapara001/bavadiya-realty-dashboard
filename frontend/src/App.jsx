import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import { CssBaseline } from '@mui/material';

function MainApp() {
  const { token } = useContext(AuthContext);
  return token ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <MainApp />
    </AuthProvider>
  );
}
