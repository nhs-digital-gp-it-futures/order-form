import { ErrorContext } from 'buying-catalogue-library';
import { appBaseUri } from '../config';
import { getEndpoint } from '../endpoints';

export const withCatch = (logger, authProvider, route) => async (req, res, next) => {
  try {
    return await route(req, res, next);
  } catch (err) {
    if (err instanceof ErrorContext) {
      return next(err);
    }

    if (err.response && err.response.status === 401) {
      req.headers.referer = `${appBaseUri}${req.originalUrl}`;
      return authProvider.login()(req, res, next);
    }

    logger.error(`Unexpected Error:\n${err.stack}`);
    const defaultError = new ErrorContext({ status: 500 });
    return next(defaultError);
  }
};

export const extractAccessToken = ({ req, tokenType }) => req.session
  && req.session.accessToken && req.session.accessToken[`${tokenType}_token`];

export const getHealthCheckDependencies = () => {
  const dependencies = [
    {
      name: 'Identity Server',
      endpoint: getEndpoint({ api: 'identity', endpointLocator: 'getApiHealth' }),
      critical: true,
    },
    {
      name: 'Document API',
      endpoint: getEndpoint({ api: 'dapi', endpointLocator: 'getApiHealth' }),
    },
  ];

  return dependencies;
};
