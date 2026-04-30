// Frontend API Configuration
// This file manages API endpoints for different environments

const API_CONFIG = {
  // Local development API base URL
  local: {
    baseURL: process.env.REACT_APP_LOCAL_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000
  },
  
  // Production API base URL (can be customized)
  production: {
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://your-production-api.com/api',
    timeout: 10000
  },
  
  // Current environment configuration
  getCurrentConfig() {
    // Always use local configuration for development
    // Check if we're in development mode or force local
    if (process.env.NODE_ENV === 'development' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        process.env.REACT_APP_USE_LOCAL_API === 'true') {
      console.log('🔗 Using LOCAL API configuration');
      return this.local;
    }
    
    // Use production config for other environments
    console.log('🌐 Using PRODUCTION API configuration');
    return this.production;
  },
  
  // Get the base API URL
  getBaseURL() {
    return this.getCurrentConfig().baseURL;
  },
  
  // Individual endpoint URLs
  endpoints: {
    login: '/login',
    data: '/data',
    employees: '/employees',
    projects: '/projects',
    users: '/users',
    profile: '/users/profile',
    health: '/health',
    companyConfig: '/company/config',
    analytics: '/analytics/dashboard',
    export: '/export',
    audit: '/audit',
    notifications: '/notifications',
    search: '/search'
  },
  
  // Build full API URL
  buildURL(endpoint) {
    const baseURL = this.getBaseURL();
    const fullURL = `${baseURL}${endpoint}`;
    console.log(`🌐 API Request: ${fullURL}`);
    return fullURL;
  }
};

export default API_CONFIG;