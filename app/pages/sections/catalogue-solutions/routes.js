import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch } from '../../../helpers/routerHelper';

const router = express.Router({ mergeParams: true });

export const catalogueSolutionsRoutes = (authProvider) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    logger.info('The catalogue solutions page');
    return res.send(`The catalogue solutions page for order ${orderId}`);
  }));

  return router;
};
