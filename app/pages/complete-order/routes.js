import express from 'express';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getCompleteOrderContext } from './controller';
import { getOrderConfirmationContext } from './order-confirmation/controller';
import { getFundingSource } from '../../helpers/api/ordapi/getFundingSource';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';
import { sessionKeys } from '../../helpers/routes/sessionHelper';

const router = express.Router({ mergeParams: true });

export const completeOrderRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const fundingSource = await getFundingSource({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: sessionKeys.fundingSource, value: fundingSource });
    const orderDescription = await getOrderDescription({
      req,
      sessionManager,
      accessToken,
      logger,
    });

    const context = await getCompleteOrderContext({ orderId, orderDescription, fundingSource });

    logger.info(`navigating to order ${orderId} complete-order page`);
    res.render('pages/complete-order/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/order-confirmation', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const fundingSource = sessionManager.getFromSession({ req, key: sessionKeys.fundingSource });

    const context = await getOrderConfirmationContext({ orderId, fundingSource });

    logger.info(`navigating to order ${orderId} order-confirmation page`);
    res.render('pages/complete-order/order-confirmation/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
