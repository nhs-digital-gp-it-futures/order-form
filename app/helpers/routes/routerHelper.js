import { ErrorContext } from 'buying-catalogue-library';
import {
  appBaseUri,
  documentApiHost,
  identityServerUrl,
} from '../../config';

export const withCatch = (logger, authProvider, route) => async (req, res, next) => {
  try {
    return await route(req, res, next);
  } catch (err) {
    if (err instanceof ErrorContext) {
      return next(err);
    }

    let responseData;
    if (err.response) {
      if (err.response.status === 401) {
        req.headers.referer = `${appBaseUri}${req.originalUrl}`;
        return authProvider.login()(req, res, next);
      }

      responseData = err.response.data;
    }

    logger.error(`Unexpected Error:\n${err.stack}`);

    const defaultError = new ErrorContext({
      status: 500,
      stackTrace: err.stack,
      data: responseData,
    });

    return next(defaultError);
  }
};

export const extractAccessToken = ({ req, tokenType }) => req.session
  && req.session.accessToken && req.session.accessToken[`${tokenType}_token`];

export const getHealthCheckDependencies = () => {
  const dependencies = [
    {
      name: 'Identity Server',
      endpoint: `${identityServerUrl}/health/ready`,
      critical: true,
    },
    {
      name: 'Document API',
      endpoint: `${documentApiHost}/health/ready`,
    },
  ];

  return dependencies;
};
