import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routes/routerHelper';
import {
  getAdditionalServicesPageContext,
  putAdditionalServices,
} from './additional-services/controller';
import { additionalServicesSelectRoutes } from './select/routes';
import { getOrderItemContext } from './order-item/controller';
import { getPageData } from './order-item/routesHelper';

const router = express.Router({ mergeParams: true });

export const additionalServicesRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getAdditionalServicesPageContext({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} additional-services page`);
    return res.render('pages/sections/additional-services/additional-services/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putAdditionalServices({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.use('/select', additionalServicesSelectRoutes(authProvider, addContext, sessionManager));

  router.get('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const pageData = await getPageData({
      req,
      sessionManager,
      accessToken,
      orderId,
      orderItemId,
    });

    sessionManager.saveToSession({ req, key: 'orderItemPageData', value: pageData });

    const context = await getOrderItemContext({
      orderId,
      orderItemId,
      orderItemType: 'catalogue-solutions',
      solutionName: pageData.solutionName,
      odsCode: pageData.serviceRecipientId,
      serviceRecipientName: pageData.serviceRecipientName,
      selectedPrice: pageData.selectedPrice,
      formData: pageData.formData,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/additional-services/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
