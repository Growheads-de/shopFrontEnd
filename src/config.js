const defaultConfig = {
  shopName: 'GrowBNB',
  apiBaseUrl: 'http://10.10.10.43:9303',
  fallbackUrl: 'https://growbnb.de/',
  // Add other configuration values here as needed
};

let config = { ...defaultConfig };

// Try to load local config if it exists
try {
  const localConfig = require('./config.local.js').default;
  config = { ...defaultConfig, ...localConfig };
  console.log('Local configuration loaded');
} catch (error) {
  // Local config doesn't exist, using default config
  console.log('Using default configuration');
}

export default config; 