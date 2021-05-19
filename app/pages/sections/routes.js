import express from 'express';
import { logger } from '../../logger';
import config from '../../config';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import {
  getCallOffOrderingPartyContext, getCallOffOrderingPartyErrorContext,
} from './ordering-party/controller';
import { getDescriptionContext, getDescriptionErrorContext, postOrPutDescription } from './description/controller';
import {
  getCommencementDateContext,
  getCommencementDateErrorContext,
  validateCommencementDateForm,
} from './commencement-date/controller';
import { getFundingSourceContext, getFundingSourceErrorPageContext, validateFundingSourceForm } from './funding-source/controller';
import { supplierRoutes } from './supplier/routes';
import { catalogueSolutionsRoutes } from './order-items/catalogue-solutions/routes';
import { additionalServicesRoutes } from './order-items/additional-services/routes';
import { associatedServicesRoutes } from './order-items/associated-services/routes';
import { getFundingSource } from '../../helpers/api/ordapi/getFundingSource';
import { putFundingSource } from '../../helpers/api/ordapi/putFundingSource';
import { putOrderingParty } from '../../helpers/api/ordapi/putOrderingParty';
import { putCommencementDate } from '../../helpers/api/ordapi/putCommencementDate';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';
import { deleteCatalogueSolutionsRoutes } from './order-items/catalogue-solutions/delete/routes';
import { deleteAdditionalServicesRoutes } from './order-items/additional-services/delete/routes';
import { deleteAssociatedServicesRoutes } from './order-items/associated-services/delete/routes';

const router = express.Router({ mergeParams: true });

export const sectionRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/description', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { odsCode, orderId } = req.params;
    const context = await getDescriptionContext({
      req,
      odsCode,
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
      sessionManager,
      logger,
    });

    logger.info(`navigating to order ${orderId} description page`);
    res.render('pages/sections/description/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/description', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { organisationId } = await getOrganisationFromOdsCode({
      req, sessionManager, odsCode, accessToken,
    });
    const response = await postOrPutDescription({
      orgId: organisationId,
      orderId,
      data: req.body,
      accessToken,
    });

    if (response.success) {
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${response.orderId}`);
    }

    const context = await getDescriptionErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/description/template', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { organisationId } = await getOrganisationFromOdsCode({
      req, sessionManager, odsCode, accessToken,
    });
    const orgId = organisationId;
    const context = await getCallOffOrderingPartyContext({
      orderId, orgId, accessToken: extractAccessToken({ req, tokenType: 'access' }), odsCode,
    });
    logger.info(`navigating to order ${orderId} ordering-party page`);
    res.render('pages/sections/ordering-party/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const response = await putOrderingParty({
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });
    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}`);

    const context = await getCallOffOrderingPartyErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/ordering-party/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.use('/supplier', supplierRoutes(authProvider, addContext, sessionManager));

  router.use('/catalogue-solutions', catalogueSolutionsRoutes(authProvider, addContext, sessionManager));

  router.use('/catalogue-solutions/delete', deleteCatalogueSolutionsRoutes(authProvider, addContext, sessionManager));

  router.use('/additional-services', additionalServicesRoutes(authProvider, addContext, sessionManager));

  router.use('/additional-services/delete', deleteAdditionalServicesRoutes(authProvider, addContext, sessionManager));

  router.use('/associated-services', associatedServicesRoutes(authProvider, addContext, sessionManager));

  router.use('/associated-services/delete', deleteAssociatedServicesRoutes(authProvider, addContext, sessionManager));

  router.get('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { odsCode, orderId } = req.params;
    const context = await getCommencementDateContext({ odsCode, orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    logger.info(`navigating to order ${orderId} commencement-date page`);
    res.render('pages/sections/commencement-date/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const validationErrors = [];

    const errors = validateCommencementDateForm({ data: req.body });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const apiResponse = await putCommencementDate({
        orderId,
        data: req.body,
        accessToken: extractAccessToken({ req, tokenType: 'access' }),
      });
      if (apiResponse.success) return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}`);
      validationErrors.push(...apiResponse.errors);
    }

    const context = await getCommencementDateErrorContext({
      validationErrors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/commencement-date/template', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/funding-source', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const fundingSource = await getFundingSource({ orderId, accessToken });

    const context = await getFundingSourceContext({ orderId, fundingSource, odsCode });
    logger.info(`navigating to order ${orderId} funding-source page`);
    res.render('pages/sections/funding-source/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/funding-source', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const validationErrors = [];

    const response = validateFundingSourceForm({
      orderId,
      data: req.body,
      accessToken,
    });
    if (response.success) {
      const apiResponse = await putFundingSource({
        orderId,
        fundingSource: req.body.selectFundingSource,
        accessToken,
      });
      if (apiResponse.success) {
        logger.info('redirecting to order summary page');
        return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}`);
      }
      validationErrors.push(...apiResponse.errors);
    } else {
      validationErrors.push(...response.errors);
    }

    const context = await getFundingSourceErrorPageContext({
      orderId,
      validationErrors,
      odsCode,
    });

    return res.render('pages/sections/funding-source/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  return router;
};
