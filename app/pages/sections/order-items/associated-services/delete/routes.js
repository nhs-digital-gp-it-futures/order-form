import express from 'express';
import { logger } from '../../../../../logger';
import { getDeleteCatalogueSolutionContext, deleteCatalogueSolution } from '../../catalogue-solutions/delete/controller';
import { getDeleteCatalogueSolutionConfirmationContext } from '../../catalogue-solutions/delete/confirmation/controller';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import config from '../../../../../config';
import deleteManifest from './manifest.json';
import confirmationManifest from './confirmation/manifest.json';

const router = express.Router({ mergeParams: true });

export const deleteAssociatedServicesRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/:catalogueItemId/confirmation/:solutionName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const context = await getDeleteCatalogueSolutionContext({
      req,
      sessionManager,
      accessToken,
      logger,
    });
    context.description = deleteManifest.description;
    context.backLinkHref = `${config.baseUrl}/organisation/${orderId}/associated-services/${catalogueItemId}`;

    logger.info(`navigating to order ${orderId} associated-services ${catalogueItemId} deletion page`);
    return res.render('pages/sections/order-items/catalogue-solutions/delete/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:catalogueItemId/confirmation/:solutionName', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId, solutionName } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    await deleteCatalogueSolution({ orderId, orderItemId: catalogueItemId, accessToken });

    logger.info(`navigating to order ${orderId} associated-service ${catalogueItemId} delete confirmation page`);
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/associated-services/delete/${catalogueItemId}/confirmation/${solutionName}/continue`);
  }));

  router.get('/:catalogueItemId/confirmation/:solutionName/continue', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { solutionName } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const context = await getDeleteCatalogueSolutionConfirmationContext({
      req,
      sessionManager,
      accessToken,
      logger,
    });
    context.description = confirmationManifest.description;

    logger.info(`navigating to catalogue ${solutionName} delete-associated-service-confirmation page`);
    res.render('pages/sections/order-items/catalogue-solutions/delete/confirmation/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:catalogueItemId/confirmation/:solutionName/continue', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/associated-services`);
  }));

  return router;
};
