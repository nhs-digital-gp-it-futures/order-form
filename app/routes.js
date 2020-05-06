import express from 'express';
import {
  ErrorContext, errorHandler, healthRoutes, authenticationRoutes,
} from 'buying-catalogue-library';
import config from './config';
import { logger } from './logger';
import { withCatch, getHealthCheckDependencies } from './helpers/routerHelper';
import { getDashboardContext } from './pages/dashboard/controller';
import includesContext from './includes/manifest.json';

const addContext = ({ context, user, csrfToken }) => ({
  ...context,
  ...includesContext,
  config,
  username: user && user.name,
  csrfToken,
});

export const routes = (authProvider) => {
  const router = express.Router();

  healthRoutes({ router, dependencies: getHealthCheckDependencies(config), logger });

  authenticationRoutes({
    router, authProvider, tokenType: 'id', logoutRedirectPath: config.logoutRedirectPath, logger,
  });

  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    res.redirect(`${config.baseUrl}/organisation`);
  }));

  router.get('/organisation', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const context = getDashboardContext();
    res.render('pages/dashboard/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/neworder', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    res.send(200, 'new order page');
  }));

  router.get('/organisation/neworder/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    res.send(200, 'new order description page');
  }));

  router.get('/organisation/:orderId', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    res.send(200, `existing order ${orderId} page`);
  }));

  router.get('/organisation/:orderId/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    res.send(200, `existing order ${orderId} description page`);
  }));

  router.get('*', (req) => {
    throw new ErrorContext({
      status: 404,
      title: `Incorrect url ${req.originalUrl}`,
      description: 'Please check it is valid and try again',
    });
  });

  errorHandler(router, (error, req, res) => {
    logger.error(`${error.title} - ${error.description}`);
    return res.render('pages/error/template.njk', addContext({ context: error, user: req.user }));
  });

  return router;
};
