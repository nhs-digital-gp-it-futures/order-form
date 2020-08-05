const { isApiReady } = require('buying-catalogue-library');
const { identityServerUrl } = require('../../config');
const { logger } = require('../../logger');

const getWellKnownConfigEndpoint = () => (
  `${identityServerUrl}/.well-known/openid-configuration`
);

export const isIdentityReady = async () => {
  const identityHealthEndpoint = getWellKnownConfigEndpoint();
  return isApiReady({
    attempt: 1,
    pollDuration: 1000,
    apiName: 'Identity',
    apiHealthEndpoint: identityHealthEndpoint,
    logger,
  });
};
