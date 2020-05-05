const { isApiReady } = require('buying-catalogue-library');
const { getEndpoint } = require('../endpoints');
const { logger } = require('../logger');

export const isIdentityReady = async () => {
  const identityHealthEndpoint = getEndpoint({ endpointLocator: 'getIdentityApiHealth' });
  return isApiReady({
    attempt: 1,
    pollDuration: 1000,
    apiName: 'Identity',
    apiHealthEndpoint: identityHealthEndpoint,
    logger,
  });
};
