import express from 'express';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch } from '../../../../../helpers/routes/routerHelper';

const router = express.Router({ mergeParams: true });

export const associatedServicesSelectRoutes = (authProvider) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/associated-services/select/associated-service`);
  }));

  router.get(
    '/associated-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => res.send('Select associated services page')),
  );

  return router;
};
