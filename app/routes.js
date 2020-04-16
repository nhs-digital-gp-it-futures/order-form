import express from 'express';
import config from './config';

import { logger } from './logger';
import { withCatch, extractAccessToken } from './helpers/routerHelper';
import { getIndexContext } from './pages/index/controller';
import { getErrorContext } from './pages/error/controller';

const addContext = ({ context, user, csrfToken }) => ({
  ...context,
  config,
  username: user && user.name,
  csrfToken,
});

export const routes = (authProvider) => {
  const router = express.Router();

  router.get('/login', authProvider.login());

  router.get('/oauth/callback', authProvider.loginCallback());

  router.get('/logout', async (req, res) => {
    const url = await authProvider.logout({ idToken: extractAccessToken({ req, tokenType: 'id' }) });
    res.redirect(url);
  });

  router.get('/signout-callback-oidc', async (req, res) => {
    if (req.logout) req.logout();
    req.session = null;

    if (req.headers.cookie) {
      req.headers.cookie.split(';')
        .map(cookie => cookie.split('=')[0])
        .forEach(cookieKey => res.clearCookie(cookieKey));
    }

    res.redirect(config.logoutRedirectPath);
  });

  router.get('/index', authProvider.authorise(), withCatch(authProvider, async (req, res) => {
    const context = getIndexContext();
    res.render('pages/index/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('*', (req, res, next) => {
    const error = getErrorContext({
      status: 404,
      title: `Incorrect url ${req.originalUrl}`,
      description: 'Please check it is valid and try again',
    });
    next(error);
  });

  router.use((error, req, res, next) => {
    if (error) {
      const context = error;
      logger.error(`${context.error.title} - ${context.error.description}`);
      return res.render('pages/error/template.njk', addContext({ context, user: req.user }));
    }
    return next();
  });

  return router;
};
