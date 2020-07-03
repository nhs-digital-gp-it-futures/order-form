import express from 'express';
import { logger } from '../../logger';
import config from '../../config';
import { withCatch, extractAccessToken } from '../../helpers/routerHelper';
import {
  getCallOffOrderingPartyContext, getCallOffOrderingPartyErrorContext, putCallOffOrderingParty,
} from './ordering-party/controller';
import { getDescriptionContext, getDescriptionErrorContext, postOrPutDescription } from './description/controller';
import { getCommencementDateContext, putCommencementDate, getCommencementDateErrorContext } from './commencement-date/controller';
import { getServiceRecipientsContext, putServiceRecipients } from './service-recipients/controller';
import { supplierRoutes } from './supplier/routes';
import { catalogueSolutionsRoutes } from './catalogue-solutions/routes';
import { additionalServicesRoutes } from './additional-services/routes';

const router = express.Router({ mergeParams: true });

export const sectionRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/description', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getDescriptionContext({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    logger.info(`navigating to order ${orderId} description page`);
    res.render('pages/sections/description/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/description', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
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

  router.get('/ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const orgId = req.user.primaryOrganisationId;
    const context = await getCallOffOrderingPartyContext({ orderId, orgId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    logger.info(`navigating to order ${orderId} ordering-party page`);
    res.render('pages/sections/ordering-party/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/ordering-party', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const response = await putCallOffOrderingParty({
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
    return res.render('pages/sections/ordering-party/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.use('/supplier', supplierRoutes(authProvider, addContext, sessionManager));

  router.use('/catalogue-solutions', catalogueSolutionsRoutes(authProvider, addContext, sessionManager));

  router.use('/additional-services', additionalServicesRoutes(authProvider, addContext, sessionManager));

  router.get('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getCommencementDateContext({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    logger.info(`navigating to order ${orderId} commencement-date page`);
    res.render('pages/sections/commencement-date/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = await putCommencementDate({
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${orderId}`);

    const context = await getCommencementDateErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
    });
    return res.render('pages/sections/commencement-date/template', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/service-recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const { selectStatus } = req.query;
    const context = await getServiceRecipientsContext({
      orderId, orgId: req.user.primaryOrganisationId, selectStatus, accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });
    logger.info(`navigating to order ${orderId} service-recipients page`);
    res.render('pages/sections/service-recipients/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/service-recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    await putServiceRecipients({
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  return router;
};
