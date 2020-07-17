import express from 'express';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getAssociatedServicePageContext, findAssociatedServices } from './associated-service/controller';

const router = express.Router({ mergeParams: true });

export const associatedServicesSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/associated-services/select/associated-service`);
  }));

  router.get(
    '/associated-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => {
      const { orderId } = req.params;
      const associatedServices = await findAssociatedServices({ req, sessionManager });

      // Temporary inclusion until associated services displayed on page
      logger.info(`Found the following associated services: ${JSON.stringify(associatedServices)}`);

      const context = getAssociatedServicePageContext({
        orderId,
        accessToken: extractAccessToken({ req, tokenType: 'access' }),
      });

      logger.info(`navigating to order ${orderId} associated-services select associated-service page`);
      return res.render('pages/sections/order-items/associated-services/select/associated-service/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }),
  );

  return router;
};
