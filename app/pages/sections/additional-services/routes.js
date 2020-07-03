import express from 'express';
import { logger } from '../../../logger';
import { withCatch } from '../../../helpers/routerHelper';

const router = express.Router({ mergeParams: true });

export const additionalServicesRoutes = (authProvider) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => res.send('Additional service page')));

  return router;
};
