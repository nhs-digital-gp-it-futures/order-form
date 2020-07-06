import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import {
  getOrderItem,
  getOrderItemContext,
  getSelectedPrice,
  getOrderItemErrorPageContext,
  validateOrderItemForm,
  getSolution,
  postSolutionOrderItem,
} from './order-item/controller';
import { catalogueSolutionsSelectRoutes } from './select/routes';


const router = express.Router({ mergeParams: true });

export const catalogueSolutionsRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getCatalogueSolutionsPageContext({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions page`);
    return res.render('pages/sections/catalogue-solutions/catalogue-solutions/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putCatalogueSolutions({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.use('/select', catalogueSolutionsSelectRoutes(authProvider, addContext, sessionManager));

  router.get('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    let selectedPrice;
    let formData;

    if (orderItemId !== 'newsolution') {
      selectedPrice = await getOrderItem({ orderId, orderItemId, accessToken });
      const date = selectedPrice.deliveryDate.split('-');
      formData = {
        'deliveryDate-year': date[0],
        'deliveryDate-month': date[1],
        'deliveryDate-day': date[2],
        quantity: selectedPrice.quantity,
        selectEstimationPeriod: selectedPrice.estimationPeriod,
        price: selectedPrice.price,
      };
    } else {
      selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    }

    sessionManager.saveToSession({ req, key: 'solutionName', value: solutionName });
    sessionManager.saveToSession({ req, key: 'selectedPrice', value: selectedPrice });

    const context = await getOrderItemContext({
      orderId,
      solutionName,
      selectedRecipientId,
      serviceRecipientName,
      selectedPriceId,
      selectedPrice,
      formData,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const solutionName = sessionManager.getFromSession({ req, key: 'solutionName' });
    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPrice = sessionManager.getFromSession({ req, key: 'selectedPrice' });
    const response = validateOrderItemForm({ data: req.body, selectedPrice });

    if (response.success) {
      const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
      const detail = req.body;
      await postSolutionOrderItem({
        orderId,
        accessToken,
        selectedRecipientId,
        serviceRecipientName,
        selectedSolutionId,
        solutionName,
        selectedPrice,
        detail,
      });
      logger.info('redirecting catalogue solutions main page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions`);
    }

    const context = await getOrderItemErrorPageContext({
      orderId,
      solutionName,
      selectedRecipientId,
      serviceRecipientName,
      selectedPrice,
      formData: req.body,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
