import express from 'express';
import { logger } from './logger';
import { withCatch, extractAccessToken } from './helpers/routerHelper';
import { errorHandler } from './pages/error/errorHandler';
import includesContext from './includes/manifest.json';
import config from './config';
import healthRoutes from './pages/health/routes';

const addContext = ({ context, user, csrfToken }) => ({
  ...context,
  ...includesContext,
  config,
  username: user && user.name,
  csrfToken,
});

export const routes = (authProvider) => {
  const router = express.Router();

  router.use('/health', healthRoutes);

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

  router.get('/dashboard', authProvider.authorise(), withCatch(authProvider, async (req, res) => {
    logger.info('navigating to dashboard page');
    res.render('pages/dashboard/template.njk', addContext({ context: {}, user: req.user }));
  }));

  router.get('*', (req, res, next) => next({
    status: 404,
    message: `Incorrect url ${req.originalUrl} - please check it is valid and try again`,
  }));

  router.use((err, req, res, next) => {
    if (err) {
      const context = errorHandler(err);
      logger.error(context.message);
      return res.render('pages/error/template.njk', addContext({ context, user: req.user }));
    }
    return next();
  });

  return router;
};
