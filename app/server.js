require('dotenv').config();
const { ConfigHelper, sessionManager } = require('buying-catalogue-library');
const config = require('./config');
const { App } = require('./app');
const { routes } = require('./routes');
const { logger } = require('./logger');
const { isIdentityReady } = require('./helpers/app/isIdentityReady');
const { createAuthProvider } = require('./helpers/app/createAuthProvider');

Object.keys(config).map((configKey) => {
  if (config[configKey]) {
    const value = ConfigHelper.getConfigKeyValue(configKey, config[configKey]);
    logger.info(`${configKey} set to ${value}`);
  } else {
    logger.error(`${configKey} not set`);
  }
});

(async () => {
  await isIdentityReady();

  // Create authProvider
  const authProvider = createAuthProvider({ config });

  // Create app
  const app = new App(authProvider).createApp();
  app.use(config.baseUrl, routes(authProvider, sessionManager({ logger })));

  // Run application on configured port
  if (config.env === 'development') {
    logger.info(`Order Form - \x1b[35m${config.appBaseUri}${config.baseUrl}/\x1b[0m`);
  } else {
    logger.info(`App listening on port ${config.port} - Order Form`);
  }
  app.listen(config.port);
})();
