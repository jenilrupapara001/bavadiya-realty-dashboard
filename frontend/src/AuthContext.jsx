import React, { createContext, useState } from 'react';
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const login = (tk) => { setToken(tk); localStorage.setItem('token', tk); };
  const logout = () => { setToken(''); localStorage.removeItem('token'); };
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
