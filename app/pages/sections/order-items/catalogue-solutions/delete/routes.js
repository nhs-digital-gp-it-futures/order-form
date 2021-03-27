import express from 'express';
import { logger } from '../../../../../logger';
import { getDeleteCatalogueSolutionContext, deleteCatalogueSolution } from './controller';
import { getDeleteCatalogueSolutionConfirmationContext } from './confirmation/controller';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import config from '../../../../../config';

const router = express.Router({ mergeParams: true });

export const deleteCatalogueSolutionsRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/:orderItemId/confirmation/:solutionName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const context = await getDeleteCatalogueSolutionContext({
      req,
      sessionManager,
      accessToken,
      logger,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions ${orderItemId} deletion page`);
    return res.render('pages/sections/order-items/catalogue-solutions/delete/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId/confirmation/:solutionName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId, solutionName } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    await deleteCatalogueSolution({ orderId, orderItemId, accessToken });

    logger.info(`navigating to order ${orderId} catalogue-solution ${orderItemId} delete confirmation page`);
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/delete/${orderItemId}/confirmation/${solutionName}/continue`);
  }));

  router.get('/:orderItemId/confirmation/:solutionName/continue', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { solutionName } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const context = await getDeleteCatalogueSolutionConfirmationContext({
      req,
      sessionManager,
      accessToken,
      logger,
    });

    logger.info(`navigating to catalogue ${solutionName} delete-catalogue-confirmation page`);
    res.render('pages/sections/order-items/catalogue-solutions/delete/confirmation/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId/confirmation/:solutionName/continue', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions`);
  }));

  return router;
};
