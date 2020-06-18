import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import { getOrderItemContext } from './order-item/controller';
import { catalogueSolutionsSelectRoutes } from './select/routes';


const router = express.Router({ mergeParams: true });

export const catalogueSolutionsRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getCatalogueSolutionsPageContext({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions page`);
    return res.render('pages/sections/catalogue-solutions/catalogue-solutions/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putCatalogueSolutions({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.use('/select', catalogueSolutionsSelectRoutes(authProvider, addContext, sessionManager));

  router.get('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });

    const context = await getOrderItemContext({
      orderId,
      selectedSolutionId,
      selectedRecipientId,
      selectedPriceId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
