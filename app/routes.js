import express from 'express';
import {
  ErrorContext, errorHandler, healthRoutes, authenticationRoutes,
} from 'buying-catalogue-library';
import config from './config';
import { logger } from './logger';
import { withCatch, getHealthCheckDependencies, extractAccessToken } from './helpers/routes/routerHelper';
import { getDocumentByFileName } from './documentController';
import { getDashboardContext } from './pages/dashboard/controller';
import { getTaskListPageContext } from './pages/task-list/controller';
import { getOrder, getPreviewPageContext } from './pages/preview/controller';
import { sectionRoutes } from './pages/sections/routes';
import includesContext from './includes/manifest.json';

const addContext = ({ context, user, csrfToken }) => ({
  ...context,
  ...includesContext,
  config,
  username: user && user.name,
  organisation: user && user.primaryOrganisationName,
  csrfToken,
});

export const routes = (authProvider, sessionManager) => {
  const router = express.Router();

  healthRoutes({ router, dependencies: getHealthCheckDependencies(config), logger });

  authenticationRoutes({
    router, authProvider, tokenType: 'id', logoutRedirectPath: config.logoutRedirectPath, logger,
  });

  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    logger.info('redirecting to organisation orders page');
    return res.redirect(`${config.baseUrl}/organisation`);
  }));

  router.get('/document/:documentName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { documentName } = req.params;
    const contentType = 'application/pdf';
    const stream = await getDocumentByFileName({ res, documentName, contentType });
    stream.on('close', () => res.end());
  }));

  router.get('/organisation', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const context = await getDashboardContext({
      accessToken,
      orgId: req.user.primaryOrganisationId,
      orgName: req.user.primaryOrganisationName,
    });
    logger.info('navigating to organisation orders page');
    res.render('pages/dashboard/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/:orderId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId } = req.params;

    sessionManager.clearFromSession({ req, keys: ['selectedSupplier', 'suppliersFound'] });

    const context = await getTaskListPageContext({ accessToken, orderId });
    logger.info(`navigating to order ${orderId} task list page`);
    res.render('pages/task-list/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/:orderId/preview', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId } = req.params;

    const orderData = await getOrder({ orderId, accessToken });

    const context = await getPreviewPageContext({ orderId, orderData });

    res.render('pages/preview/template.njk', addContext({ context, user: req.user }));
  }));

  router.use('/organisation/:orderId', sectionRoutes(authProvider, addContext, sessionManager));

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
