import { appBaseUri } from '../config';

export const withCatch = (authProvider, route) => async (req, res, next) => {
  try {
    return await route(req, res, next);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      req.headers.referer = `${appBaseUri}${req.originalUrl}`;
      return authProvider.login()(req, res, next);
    }
    return next(err);
  }
};

export const extractAccessToken = ({ req, tokenType }) => req.session
  && req.session.accessToken && req.session.accessToken[`${tokenType}_token`];
