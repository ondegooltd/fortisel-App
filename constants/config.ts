import Constants from 'expo-constants';

// Environment variables are accessed through Constants.expoConfig.extra
// You'll need to configure these in app.json or app.config.js
export const CONFIG = {
  // API Configuration
  API_BASE_URL:
    Constants.expoConfig?.extra?.API_BASE_URL || 'http://172.20.10.3:3000/api',
  API_TIMEOUT: Constants.expoConfig?.extra?.API_TIMEOUT || 10000,

  // Google Services
  GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_WEB_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID:
    Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID || '',

  // App Configuration
  APP_NAME: Constants.expoConfig?.extra?.APP_NAME || 'Fortisel',
  APP_VERSION: Constants.expoConfig?.extra?.APP_VERSION || '1.0.0',
  ENVIRONMENT: Constants.expoConfig?.extra?.ENVIRONMENT || 'development',

  // Payment Configuration
  PAYMENT_GATEWAY_URL: Constants.expoConfig?.extra?.PAYMENT_GATEWAY_URL || '',
  PAYMENT_PUBLIC_KEY: Constants.expoConfig?.extra?.PAYMENT_PUBLIC_KEY || '',

  // Maps Configuration
  GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || '',

  // Notification Configuration
  FCM_SERVER_KEY: Constants.expoConfig?.extra?.FCM_SERVER_KEY || '',

  // Feature Flags
  ENABLE_ANALYTICS: Constants.expoConfig?.extra?.ENABLE_ANALYTICS || false,
  ENABLE_CRASH_REPORTING:
    Constants.expoConfig?.extra?.ENABLE_CRASH_REPORTING || false,
  ENABLE_PUSH_NOTIFICATIONS:
    Constants.expoConfig?.extra?.ENABLE_PUSH_NOTIFICATIONS || true,
};

// Helper function to check if we're in development mode
export const isDevelopment = CONFIG.ENVIRONMENT === 'development';

// Helper function to check if we're in production mode
export const isProduction = CONFIG.ENVIRONMENT === 'production';

// Helper function to get API URL with endpoint
export const getApiUrl = (endpoint: string) => {
  const baseUrl = CONFIG.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};
