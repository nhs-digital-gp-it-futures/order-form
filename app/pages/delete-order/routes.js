import express from 'express';
import { getDeleteOrderContext, deleteOrder } from './controller';
import { getDeleteOrderConfirmationContext } from './delete-order-confirmation/controller';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import config from '../../config';

const router = express.Router({ mergeParams: true });

export const deleteOrderRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const context = await getDeleteOrderContext({
      req,
      sessionManager,
      accessToken,
      logger,
      odsCode,
    });

    logger.info(`navigating to order ${orderId} delete-order page`);
    res.render('pages/delete-order/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    await deleteOrder({ orderId, accessToken });

    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/delete-order/confirmation`);
  }));

  router.get('/confirmation', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const context = await getDeleteOrderConfirmationContext({
      req,
      sessionManager,
      accessToken,
      logger,
    });

    logger.info(`navigating to order ${orderId} delete-order-confirmation page`);
    res.render('pages/delete-order/delete-order-confirmation/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
