// Global Real Estate Dashboard Configuration
// This file contains all configurable settings for different real estate companies

module.exports = {
  // Default configuration for any new company
  default: {
    company: {
      name: "Bavadiya Realty LLP",
      logo: "", // Will use default logo
      theme: {
        primaryColor: "#007AFF",
        secondaryColor: "#5856D6",
        accentColor: "#007AFF"
      },
      contact: {
        email: "admin@realestate.com",
        phone: "+1-000-000-0000"
      }
    },
    dashboard: {
      title: "Real Estate Payment Management Dashboard",
      welcomeMessage: "Welcome to Real Estate Company Dashboard"
    }
  },

  // Bavadiya Realty Configuration (original company)
  bavadiya: {
    company: {
      name: "Bavadiya Realty LLP",
      logo: "https://crm.bavadiyarealty.com/storage/uploads/logo/1754457837_logo.png",
      theme: {
        primaryColor: "#007AFF",
        secondaryColor: "#5856D6",
        accentColor: "#007AFF"
      },
      contact: {
        email: "admin@bavadiyarealty.com",
        phone: "+91-9876543210"
      }
    },
    dashboard: {
      title: "Real Estate Payment Management Dashboard",
      welcomeMessage: "Welcome to Bavadiya Realty LLP"
    },
    employees: [
      { name: 'Dharmesh Bavadiya', code: 'DB001', number: '+91-9876543210' },
      { name: 'Yogesh Bavadiya', code: 'YB001', number: '+91-9876543211' },
      { name: 'Bavadiya Realty LLP', code: 'BR001', number: '+91-9876543212' },
      { name: 'Prvin Rathod', code: 'PR001', number: '+91-9876543213' },
      { name: 'Hardik Ranpariya', code: 'HR001', number: '+91-9876543214' }
    ]
  },

  // Add new company configurations here
  // Example template:
  /*
  yourcompany: {
    company: {
      name: "Your Company Name",
      logo: "https://yourcompany.com/logo.png",
      theme: {
        primaryColor: "#your-color",
        secondaryColor: "#your-color",
        accentColor: "#your-color"
      },
      contact: {
        email: "admin@yourcompany.com",
        phone: "+1-xxx-xxx-xxxx"
      }
    },
    dashboard: {
      title: "Your Dashboard Title",
      welcomeMessage: "Welcome to Your Company"
    },
    employees: [
      // Add your default employees here
    ]
  }
  */
};