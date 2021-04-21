const development = 'development';
const env = process.env.NODE_ENV || development;
const isDevelopment = () => env === development;

module.exports = {
  // App name
  appName: 'NHSD Order Form',

  // Base URL
  baseUrl: process.env.BASE_URL || '/order',

  // Public browse base URL
  publicBrowseBaseUrl: process.env.PUBLIC_BROWSE_BASE_URL || 'http://localhost:3000',

  // feedback link URL
  feedbackLinkUrl: process.env.FEEDBACK_LINK_URL || 'https://forms.office.com/Pages/ResponsePage.aspx?id=Hwf2UP67GkCIA2c3SOYp4nDHKEWnXcFHiqdJhf0fCJtUNDNFRUFZVFU5RkRQTEpWU0RQVlVXMUpRQi4u',

  // Environment
  env,
  isDevelopment,

  // Port to run local development server on
  port: process.env.PORT || 3006,

  // The base uri the app is running on to pass to identity service for redirection
  appBaseUri: process.env.APP_BASE_URI || 'http://localhost:3006',

  // Orders API
  orderApiUrl: process.env.ORDER_API_URL || 'http://localhost:5104',

  // Organisations API
  organisationApiUrl: process.env.ORGANISATION_API_URL || 'http://localhost:5103',

  // Solutions API aka Buying Catalogue API
  solutionsApiUrl: process.env.SOLUTIONS_API_URL || 'http://localhost:5100',

  // DAPI
  documentApiHost: process.env.DOCUMENT_HOST || 'http://localhost:5101',

  // LOGGER_LEVEL options are info, warn, error, off
  loggerLevel: process.env.LOGGER_LEVEL || 'error',

  // IDENTITY_SERVER
  identityServerUrl: process.env.IDENTITY_SERVER || 'http://localhost:5102/identity',

  // The base uri of identity service
  oidcBaseUri: process.env.OIDC_BASE_URI || 'http://localhost:5102/identity',

  // The client id to be sent to identity service
  oidcClientId: process.env.OIDC_CLIENT_ID || 'NodeClient',

  // The secret need to decode JWT tokens
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET,

  // The path that the user is redirected to after logout
  logoutRedirectPath: process.env.LOGOUT_REDIRECT_PATH || '/',

  // How long before the cookies stored in the session expire in ms (1 hour)
  maxCookieAge: process.env.MAX_COOKIE_AGE || 3600000,

  // The secret needed for encoding and decoding the cookie
  cookieSecret: process.env.COOKIE_SECRET,

  // The url in which redis is running
  redisUrl: process.env.REDIS_URL || 'localhost',

  // The port redis is running
  redisPort: process.env.REDIS_PORT || 6379,

  // Boolean to indicate whether to connect to redis via TLS
  redisTls: process.env.REDIS_TLS || 'false',

  // The password to connect to redis
  redisPass: process.env.REDIS_PASS,

  // content and user journey if they can order for multiple organisations
  showProxy: process.env.SHOW_PROXY || 'false',
};
