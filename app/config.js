module.exports = {
  // App name
  appName: 'NHSD Order Form',

  // Base URL
  baseUrl: process.env.BASE_URL || '',

  // Environment
  env: process.env.NODE_ENV || 'development',

  // Port to run local development server on
  port: process.env.PORT || 3006,

  // The base uri the app is running on to pass to identity service for redirection
  appBaseUri: process.env.APP_BASE_URI || 'http://localhost:3006',

  // LOGGER_LEVEL options are info, warn, error, off
  loggerLevel: process.env.LOGGER_LEVEL || 'error',
};
