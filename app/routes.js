import express from 'express';
import {
  ErrorContext, errorHandler, healthRoutes, authenticationRoutes,
  cookiePolicyAgreed, cookiePolicyExists, cookiePolicyClear,
} from 'buying-catalogue-library';
import config from './config';
import { logger } from './logger';
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
import { getOdsCodeForOrganisation } from './helpers/controllers/odsCodeLookup';
import { sessionKeys } from './helpers/routes/sessionHelper';

const addContext = ({ context, req, csrfToken }) => ({
  ...context,
  ...includesContext,
  config,
  username: req && req.user && req.user.name,
  organisation: req && req.user && req.user.primaryOrganisationName,
  csrfToken,
  showCookieBanner: !cookiePolicyExists({ req, logger }),
});

export const routes = (authProvider, sessionManager) => {
  const router = express.Router();
  const a = new Date();
  const currentTimeInMillisecods = a.getTime();

  healthRoutes({ router, dependencies: getHealthCheckDependencies(config), logger });

  authenticationRoutes({
    router, authProvider, tokenType: 'id', logoutRedirectPath: config.logoutRedirectPath, logger,
  });

  if (config.buyingcatalogueCookieConsentExpiration < currentTimeInMillisecods) {
    router.use(async (req, res, next) => {
      const cookieName = 'buyingcatalogue-cookie-consent';
      const value = req.cookies[cookieName] ? JSON.parse(req.cookies[cookieName]) : undefined;
      if (value && value.creationDate
        && (value.creationDate < config.buyingcatalogueCookieConsentExpiration)) {
        cookiePolicyClear({ res, logger });
      }
      return next();
    });
  }

  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    logger.info('redirecting to organisation orders page');
    return res.redirect(`${config.baseUrl}/organisation`);
  }));

  router.get('/dismiss-cookie-banner', (req, res) => {
    cookiePolicyAgreed({ res, logger });
    res.redirect(req.headers.referer);
  });

  router.get('/document/:documentName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { documentName } = req.params;
    const contentType = 'application/pdf';
    const stream = await getDocumentByFileName({ res, documentName, contentType });
    stream.on('close', () => res.end());
  }));

  const regExp = new RegExp('^/organisation/[A-Za-z]\\d{6}-\\d{2}');

  router.use(async (req, res, next) => {
    const trimmedUrl = req.url.replace(/\/$/, '').toLowerCase();

    if (trimmedUrl === '/organisation') {
      const sessionOdsCode = sessionManager.getFromSession({
        req,
        key: sessionKeys.selectedOdsCode,
      });
      if (sessionOdsCode) {
        return res.redirect(`${config.baseUrl}/organisation/${sessionOdsCode}`);
      }
    }

    if (trimmedUrl === '/organisation' || trimmedUrl === '/organisation/select' || regExp.exec(trimmedUrl)) {
      const organisationId = req.user ? req.user.primaryOrganisationId : null;
      if (organisationId) {
        const accessToken = extractAccessToken({ req, tokenType: 'access' });
        const odsCode = await getOdsCodeForOrganisation({
          req, sessionManager, orgId: organisationId, accessToken,
        });

        if (odsCode) {
          logger.info(`Retrieved ODS Code for Organisation Id '${req.user.primaryOrganisationId}': ${odsCode}`);

          if (trimmedUrl === '/organisation') {
            return res.redirect(`${config.baseUrl}/organisation/${odsCode}`);
          } if (trimmedUrl === '/organisation/select') {
            return res.redirect(`${config.baseUrl}/organisation/${odsCode}/select`);
          }
          const newUrl = req.url.replace('/organisation/', `/organisation/${odsCode}/order/`);

          return res.redirect(`${config.baseUrl}${newUrl}`);
        }
      }
    }

    return next();
  });

  router.use('/organisation/:odsCode', dashboardRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/select', selectOrganisationRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/order/:orderId', tasklistRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/order/:orderId/summary', summaryRoutes(authProvider, addContext));

  router.use('/organisation/:odsCode/order/:orderId/complete-order', completeOrderRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/order/:orderId/delete-order', deleteOrderRoutes(authProvider, addContext, sessionManager));

  router.use('/organisation/:odsCode/order/:orderId', sectionRoutes(authProvider, addContext, sessionManager));

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
    return res.render('pages/error/template.njk', addContext({ context, req }));
  });

  return router;
};
