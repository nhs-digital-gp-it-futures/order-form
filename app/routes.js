import express from 'express';
import {
  ErrorContext, errorHandler, healthRoutes, authenticationRoutes,
} from 'buying-catalogue-library';
import config from './config';
import { logger } from './logger';
import { getOrganisation } from './helpers/api/oapi/getOrganisation';
import { withCatch, getHealthCheckDependencies, extractAccessToken } from './helpers/routes/routerHelper';
import { getDocumentByFileName } from './helpers/api/dapi/getDocumentByFileName';
import { dashboardRoutes } from './pages/dashboard/routes';
import { tasklistRoutes } from './pages/task-list/routes';
import { sectionRoutes } from './pages/sections/routes';
import { summaryRoutes } from './pages/summary/routes';
import { completeOrderRoutes } from './pages/complete-order/routes';
import { deleteOrderRoutes } from './pages/delete-order/routes';
import { selectOrganisationRoutes } from './pages/select/routes';
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
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const orgData = await getOrganisation({ orgId: req.user.primaryOrganisationId, accessToken });
    logger.info('redirecting to organisation orders page');
    return res.redirect(`${config.baseUrl}/organisation/${orgData.odsCode}`);
  }));

  router.get('/document/:documentName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { documentName } = req.params;
    const contentType = 'application/pdf';
    const stream = await getDocumentByFileName({ res, documentName, contentType });
    stream.on('close', () => res.end());
  }));

  router.use('/organisation/:odsCode', dashboardRoutes(authProvider, addContext));

  router.use('/organisation/:odsCode/select', selectOrganisationRoutes(authProvider, addContext));

  router.use('/organisation/:odsCode/:orderId', tasklistRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/:orderId/summary', summaryRoutes(authProvider, addContext));

  router.use('/organisation/:odsCode/:orderId/complete-order', completeOrderRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/:orderId/delete-order', deleteOrderRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/:orderId', sectionRoutes(authProvider, addContext, sessionManager));

  router.get('*', (req) => {
    throw new ErrorContext({
      status: 404,
      title: `Incorrect url ${req.originalUrl}`,
      description: 'Please check it is valid and try again',
    });
  });

  errorHandler(router, (error, req, res) => {
    logger.error(`${error.title || error.name} - ${error.description || error.name}`);
    const context = {
      ...error,
      isDevelopment: config.isDevelopment(),
    };
    return res.render('pages/error/template.njk', addContext({ context, user: req.user }));
  });

  return router;
};
