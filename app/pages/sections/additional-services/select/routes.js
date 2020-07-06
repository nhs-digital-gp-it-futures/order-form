import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch } from '../../../../helpers/routerHelper';

const router = express.Router({ mergeParams: true });
export const additionalServicesSelectRoutes = (authProvider) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service`);
  }));

  router.get(
    '/additional-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => res.send('Additional service selection')),
  );

  return router;
};
