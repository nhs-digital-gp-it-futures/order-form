import express from 'express';
import { logger } from '../../../../logger';
import { withCatch } from '../../../../helpers/routes/routerHelper';

const router = express.Router({ mergeParams: true });

export const associatedServicesRoutes = (authProvider) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => res.send('Additional services page')));

  return router;
};
