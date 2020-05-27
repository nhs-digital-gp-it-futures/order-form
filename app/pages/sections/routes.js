import express from 'express';
import { logger } from '../../logger';
import config from '../../config';
import { withCatch, extractAccessToken } from '../../helpers/routerHelper';
import {
  getCallOffOrderingPartyContext, getCallOffOrderingPartyErrorContext, putCallOffOrderingParty,
} from './call-off-ordering-party/controller';
import { getDescriptionContext, getDescriptionErrorContext, postOrPutDescription } from './description/controller';
import { getCommencementDateContext, putCommencementDate } from './commencement-date/controller';
import { supplierRoutes } from './supplier/routes';

const router = express.Router({ mergeParams: true });

export const sectionRoutes = (authProvider, addContext, sessionManager) => {
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
    return res.render('pages/sections/call-off-ordering-party/template', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.use('/supplier', supplierRoutes(authProvider, addContext, sessionManager));

  router.get('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getCommencementDateContext({ orderId });
    logger.info(`navigating to order ${orderId} commencement-date page`);
    res.render('pages/sections/commencement-date/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/commencement-date', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = await putCommencementDate({
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    if (!response.success) logger.info(`validation error: ${JSON.stringify(response)}`);

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  return router;
};
