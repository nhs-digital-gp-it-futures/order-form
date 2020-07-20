import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import { associatedServicesSelectRoutes } from './select/routes';
import {
  getAssociatedServicesPageContext,
} from './dashboard/controller';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';

const router = express.Router({ mergeParams: true });

export const associatedServicesRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getAssociatedServicesPageContext({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} associated-services dashboard page`);
    return res.render('pages/sections/order-items/associated-services/dashboard/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.use('/select', associatedServicesSelectRoutes(authProvider, addContext, sessionManager));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putOrderSection({
      orderId,
      sectionId: 'associated-services',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.use('/select', associatedServicesSelectRoutes(authProvider, addContext));

  return router;
};
