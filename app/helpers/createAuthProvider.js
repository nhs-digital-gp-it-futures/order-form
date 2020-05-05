const { AuthProvider, ErrorContext } = require('buying-catalogue-library');
const { logger } = require('../logger');

export const createAuthProvider = ({ config }) => {
  const unauthenticatedError = new ErrorContext({
    status: 401,
    title: 'You\'re not authorised to view this page',
    description: 'You must be logged in as a buyer to access Buying Catalogue orders.',
    backLinkHref: config.publicBrowseBaseUrl,
  });
  const authProvider = new AuthProvider({
    config, scopes: 'Ordering', unauthenticatedError, logger,
  });
  return authProvider;
};
