import express from 'express';
import { logger } from '../../../../logger';
import { withCatch } from '../../../../helpers/routes/routerHelper';
import { associatedServicesSelectRoutes } from './select/routes';
import { getAssociatedServicesPageContext } from './dashboard/controller';

const router = express.Router({ mergeParams: true });

export const associatedServicesRoutes = (authProvider, addContext) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getAssociatedServicesPageContext({
      orderId,
    });

    logger.info(`navigating to order ${orderId} associated-services dashboard page`);
    return res.render('pages/sections/order-items/associated-services/dashboard/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.use('/select', associatedServicesSelectRoutes(authProvider, addContext));

  return router;
};
