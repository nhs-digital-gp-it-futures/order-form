import express from 'express';
import { logger } from '../../../../logger';
import { withCatch } from '../../../../helpers/routes/routerHelper';
import { associatedServicesSelectRoutes } from './select/routes';

const router = express.Router({ mergeParams: true });

export const associatedServicesRoutes = (authProvider) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => res.send('Associated services page')));

  router.use('/select', associatedServicesSelectRoutes(authProvider));

  return router;
};
