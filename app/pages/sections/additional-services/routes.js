import express from 'express';
import { logger } from '../../../logger';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import { getAdditionalServicesPageContext } from './additional-services/controller';

const router = express.Router({ mergeParams: true });

export const additionalServicesRoutes = (authProvider, addContext) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getAdditionalServicesPageContext({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} additional-services page`);
    return res.render('pages/sections/additional-services/additional-services/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
