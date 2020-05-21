import express from 'express';
import {
  ErrorContext, errorHandler, healthRoutes, authenticationRoutes,
} from 'buying-catalogue-library';
import config from './config';
import { logger } from './logger';
import { withCatch, getHealthCheckDependencies, extractAccessToken } from './helpers/routerHelper';
import { getDashboardContext } from './pages/dashboard/controller';
import { getDescriptionContext, getDescriptionErrorContext, postOrPutDescription } from './pages/sections/description/controller';
import {
  getSupplierSearchPageContext,
  validateSupplierSearchForm,
  findSuppliers,
  getSupplierSearchPageErrorContext,
} from './pages/sections/supplier/search/controller';
import includesContext from './includes/manifest.json';
import { getTaskListPageContext } from './pages/task-list/controller';
import { getCallOffOrderingPartyContext } from './pages/sections/call-off-ordering-party/controller';

const addContext = ({ context, user, csrfToken }) => ({
  ...context,
  ...includesContext,
  config,
  username: user && user.name,
  organisation: user && user.primaryOrganisationName,
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
    const context = await getDashboardContext({
      accessToken,
      orgId: req.user.primaryOrganisationId,
      orgName: req.user.primaryOrganisationName,
    });
    res.render('pages/dashboard/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/:orderId', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId } = req.params;
    const context = await getTaskListPageContext({ accessToken, orderId });
    res.render('pages/task-list/template.njk', addContext({ context, user: req.user }));
  }));

  router.get('/organisation/:orderId/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getDescriptionContext({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    res.render('pages/sections/description/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/organisation/:orderId/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const response = await postOrPutDescription({
      orgId: req.user.primaryOrganisationId, orderId, data: req.body, accessToken,
    });

    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${response.orderId}`);

    const context = await getDescriptionErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/description/template', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/organisation/:orderId/call-off-ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const orgId = req.user.primaryOrganisationId;
    const context = await getCallOffOrderingPartyContext({ orderId, orgId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    res.render('pages/sections/call-off-ordering-party/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/organisation/:orderId/supplier', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search`);
  }));

  router.get('/organisation/:orderId/supplier/search', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getSupplierSearchPageContext({ orderId });
    res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/organisation/:orderId/supplier/search', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSupplierSearchForm({ data: req.body });

    if (response.success) {
      const accessToken = extractAccessToken({ req, tokenType: 'access' });

      const suppliersFound = await findSuppliers({
        supplierNameToFind: req.body.supplierName, accessToken,
      });

      if (suppliersFound.length > 0) {
        return res.status(200).send(`${suppliersFound.length} suppliers found`);
      }

      throw new ErrorContext({
        status: 404,
        title: 'No Supplier found',
        description: "There are no suppliers that match the search terms you've provided. Try searching again.",
        backLinkText: 'Go back to search',
        backLinkHref: `${config.baseUrl}/organisation/${orderId}/supplier/search`,
      });
    }

    const context = await getSupplierSearchPageErrorContext({
      orderId,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/organisation/:orderId/supplier/search/select', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    res.status(200).send('supplier select page');
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
