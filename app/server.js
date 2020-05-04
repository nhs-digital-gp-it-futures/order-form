require('dotenv').config();
const util = require('util');
const { getData } = require('buying-catalogue-library');
const config = require('./config');
const { App } = require('./app');
const { AuthProvider } = require('./authProvider');
const { routes } = require('./routes');
const { logger } = require('./logger');
const { getEndpoint } = require('./endpoints');

Object.keys(config).map((configKey) => {
  if (config[configKey]) {
    logger.info(`${configKey} set to ${config[configKey]}`);
  } else {
    logger.error(`${configKey} not set`);
  }
});

const setTimeoutPromise = util.promisify(setTimeout);

const isIsapiReady = async ({
  attempt, pollDuration,
}) => {
  try {
    const endpoint = getEndpoint({ endpointLocator: 'getIdentityApiHealth' });
    await getData({ endpoint, logger });
    logger.info('Isapi is now ready');
    return true;
  } catch (err) {
    const nextAttempt = attempt + 1;
    const nextPollDuration = nextAttempt * pollDuration;
    logger.error(`Isapi is not ready - will poll again in ${nextAttempt} seconds`);
    return setTimeoutPromise(nextPollDuration).then(() => isIsapiReady({
      attempt: nextAttempt, pollDuration,
    }));
  }
};

(async () => {
  await isIsapiReady({ attempt: 1, pollDuration: 1000 });

  // Routes
  const authProvider = new AuthProvider();
  const app = new App(authProvider).createApp();
  app.use(config.baseUrl, routes(authProvider));

  // Run application on configured port
  if (config.env === 'development') {
    logger.info(`Order Form - \x1b[35m${config.appBaseUri}${config.baseUrl}/\x1b[0m`);
  } else {
    logger.info(`App listening on port ${config.port} - Order Form`);
  }
  app.listen(config.port);
})();
