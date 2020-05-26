import express from 'express';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../logger';
import config from '../../config';
import { withCatch, extractAccessToken } from '../../helpers/routerHelper';
import {
  getCallOffOrderingPartyContext, getCallOffOrderingPartyErrorContext, putCallOffOrderingParty,
} from './call-off-ordering-party/controller';
import { getDescriptionContext, getDescriptionErrorContext, postOrPutDescription } from './description/controller';
import {
  getSupplierSearchPageContext, validateSupplierSearchForm, getSupplierSearchPageErrorContext,
} from './supplier/search/controller';
import { findSuppliers, getSupplierSelectPageContext } from './supplier/select/controller';
import { getCommencementDateContext, putCommencementDate } from './commencement-date/controller';

const router = express.Router({ mergeParams: true });

export const sectionRoutes = (authProvider, addContext) => {
  router.get('/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getDescriptionContext({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    logger.info(`navigating to order ${orderId} description page`);
    res.render('pages/sections/description/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/description', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const response = await postOrPutDescription({
      orgId: req.user.primaryOrganisationId,
      orderId,
      data: req.body,
      accessToken,
    });

    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${response.orderId}`);

    const context = await getDescriptionErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/description/template', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/call-off-ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const orgId = req.user.primaryOrganisationId;
    const context = await getCallOffOrderingPartyContext({ orderId, orgId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    logger.info(`navigating to order ${orderId} call-off-ordering-party page`);
    res.render('pages/sections/call-off-ordering-party/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/call-off-ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const response = await putCallOffOrderingParty({
      orgId: req.user.primaryOrganisationId,
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });
    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${orderId}`);

    const context = await getCallOffOrderingPartyErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/call-off-ordering-party//template', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/supplier', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    logger.info(`redirecting to order ${orderId} supplier search page`);
    res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search`);
  }));

  router.get('/supplier/search', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getSupplierSearchPageContext({ orderId });
    logger.info(`navigating to order ${orderId} supplier search page`);
    res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/supplier/search', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSupplierSearchForm({ data: req.body });

    if (response.success) {
      logger.info(`redirecting to order ${orderId} supplier search results page`);
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search?name=${req.body.supplierName}`);
    }

    const context = await getSupplierSearchPageErrorContext({
      orderId,
      validationErrors: response.errors,
    });
    logger.info(`navigating to order ${orderId} supplier search page (with errors)`);
    return res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/supplier/search/select', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const { name } = req.query;

    if (name) {
      const accessToken = extractAccessToken({ req, tokenType: 'access' });

      const suppliersFound = await findSuppliers({
        name, accessToken,
      });

      if (suppliersFound.length > 0) {
        const context = getSupplierSelectPageContext({ orderId, suppliers: suppliersFound });
        logger.info(`navigating to order ${orderId} supplier select page`);
        return res.render('pages/sections/supplier/select/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
      }

      throw new ErrorContext({
        status: 404,
        title: 'No Supplier found',
        description: "There are no suppliers that match the search terms you've provided. Try searching again.",
        backLinkText: 'Go back to search',
        backLinkHref: `${config.baseUrl}/organisation/${orderId}/supplier/search`,
      });
    }
    logger.info(`redirecting to order ${orderId} supplier search page`);
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search`);
  }));

  router.get('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getCommencementDateContext({ orderId });
    logger.info(`navigating to order ${orderId} commencement-date page`);
    res.render('pages/sections/commencement-date/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = await putCommencementDate({
      orgId: req.user.primaryOrganisationId,
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    if (!response.success) logger.info(`validation error: ${JSON.stringify(response)}`);

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  return router;
};
