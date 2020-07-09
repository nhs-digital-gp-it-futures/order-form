const { AuthProvider, ErrorContext } = require('buying-catalogue-library');
const { logger } = require('../../logger');

export const createAuthProvider = ({ config }) => {
  const unauthenticatedError = new ErrorContext({
    status: 401,
    title: 'You\'re not logged in as a buyer',
    description: 'Only users with a buyer account can create and manage orders on the Buying Catalogue.',
    backLinkHref: config.publicBrowseBaseUrl,
  });
  const authProvider = new AuthProvider({
    config, scopes: 'Ordering Organisation', unauthenticatedError, logger,
  });
  return authProvider;
};
