import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routerHelper';
import {
  findAdditionalServices,
  getAdditionalServicePageContext,
} from './additional-service/controller';

const router = express.Router({ mergeParams: true });

export const additionalServicesSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service`);
  }));

  router.get(
    '/additional-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => {
      const { orderId } = req.params;
      const accessToken = extractAccessToken({ req, tokenType: 'access' });
      const additionalServices = await findAdditionalServices({ accessToken });
      sessionManager.saveToSession({ req, key: 'additionalServices', value: additionalServices });

      const context = getAdditionalServicePageContext({ orderId, additionalServices });

      logger.info(`navigating to order ${orderId} additional-services select additional-service page`);
      return res.render('pages/sections/additional-services/select/additional-service/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }),
  );

  return router;
};
