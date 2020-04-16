module.exports = {
  // App name
  appName: 'NHSD Order Form',

  // Base URL
  baseUrl: process.env.BASE_URL || '',

  // Public browse base URL
  publicBrowseBaseUrl: process.env.PUBLIC_BROWSE_BASE_URL || '/',

  // Environment
  env: process.env.NODE_ENV || 'development',

  // Port to run local development server on
  port: process.env.PORT || 3006,

  // The base uri the app is running on to pass to identity service for redirection
  appBaseUri: process.env.APP_BASE_URI || 'http://localhost:3006',

  // LOGGER_LEVEL options are info, warn, error, off
  loggerLevel: process.env.LOGGER_LEVEL || 'error',

  // The base uri of identity service
  oidcBaseUri: process.env.OIDC_BASE_URI || 'http://localhost:5102',

  // The client id to be sent to identity service
  oidcClientId: process.env.OIDC_CLIENT_ID || 'SampleClient',

  // The secret need to decode JWT tokens
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET,

  // The path that the user is redirected to after logout
  logoutRedirectPath: process.env.LOGOUT_REDIRECT_PATH || '/',

  // How long before the cookies stored in the session expire in ms (1 hour)
  maxCookieAge: process.env.MAX_COOKIE_AGE || 3600000,

  // The secret needed for encoding and decoding the cookie
  cookieSecret: process.env.COOKIE_SECRET,
};
