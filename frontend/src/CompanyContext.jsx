import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_CONFIG from './config/api';

export const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [companyConfig, setCompanyConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyConfig();
  }, []);

  const fetchCompanyConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_CONFIG.buildURL(API_CONFIG.endpoints.companyConfig));
      setCompanyConfig(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching company config:', err);
      setError('Failed to load company configuration');
      // Set default fallback config
      setCompanyConfig({
        company: {
          name: "Bavadiya Realty LLP",
          logo: "",
          contact: {
            email: "admin@realestate.com",
            phone: "+1-000-000-0000"
          }
        },
        dashboard: {
          title: "Real Estate Payment Management Dashboard",
          welcomeMessage: "Welcome to Real Estate Company Dashboard"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyContext.Provider value={{
      companyConfig,
      loading,
      error,
      refetch: fetchCompanyConfig
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}