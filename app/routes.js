import express from 'express';
import {
  ErrorContext, errorHandler, healthRoutes, authenticationRoutes,
} from 'buying-catalogue-library';
import config from './config';
import { logger } from './logger';
import { withCatch, getHealthCheckDependencies, extractAccessToken } from './helpers/routerHelper';
import { getDashboardContext } from './pages/dashboard/controller';
import { getDescriptionContext, postOrPatchDescription } from './pages/items/description/controller';
import includesContext from './includes/manifest.json';
import { getNewOrderPageContext } from './pages/order-task-list/controller';

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
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    // TODO: Pass in orgId to getDashboardContext
    const context = await getDashboardContext({ accessToken });
    res.render('pages/dashboard/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/neworder', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const context = getNewOrderPageContext();
    res.render('pages/order-task-list/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/neworder/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const context = getDescriptionContext({ orderId: 'neworder' });
    res.render('pages/items/description/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/organisation/:orderId', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    res.status(200).send(`existing order ${orderId} page`);
  }));

  router.get('/organisation/:orderId/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = getDescriptionContext({ orderId });
    res.render('pages/items/description/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/organisation/:orderId/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const response = await postOrPatchDescription({ orderId, data: req.body, accessToken });
    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${response.orderId}`);
    // TODO: res.redirect for validation errors
    res.status(200).send(`redirect with validation to ${orderId} page`);
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
