import express from 'express';
import { logger } from '../../../../../logger';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { deleteCatalogueSolution } from './controller';
import config from '../../../../../config';

const router = express.Router({ mergeParams: true });

export const deleteCatalogueSolutionsRoutes = (authProvider, addContext) => {
  router.get('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;

    const context = {};

    logger.info(`navigating to order ${orderId} catalogue-solutions ${orderItemId} deletion page`);
    return res.render('pages/sections/order-items/catalogue-solutions/dashboard/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    await deleteCatalogueSolution({ orderId, orderItemId, accessToken });

    logger.info(`navigating to order ${orderId} catalogue-solution ${orderItemId} delete confirmation page`);
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/delete/${orderItemId}/confirmation`);
  }));

  return router;
};
