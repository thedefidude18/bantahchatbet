export const ADMIN_CREDENTIALS = {
  // In a real production environment, these should be environment variables
  credentials: [
    {
      email: 'admin@bantahchatbet.com',
      password: 'admin123', // This should be hashed in production
      name: 'Admin User'
    }
  ]
};

// Add more admin-specific configuration here
export const ADMIN_CONFIG = {
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000 // 30 minutes in milliseconds
};