import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import {
  getOrderItemContext,
  getSelectedPrice,
  getOrderItemErrorPageContext,
  validateOrderItemForm,
  getSolution,
  postSolution,
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
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });

    const solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
    sessionManager.saveToSession({ req, key: 'solutionName', value: solutionName });

    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });
    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    sessionManager.saveToSession({ req, key: 'selectedPrice', value: selectedPrice });

    const context = await getOrderItemContext({
      orderId,
      solutionName,
      selectedRecipientId,
      serviceRecipientName,
      selectedPriceId,
      selectedPrice,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const response = validateOrderItemForm({ data: req.body });
    const solutionName = sessionManager.getFromSession({ req, key: 'solutionName' });
    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPrice = sessionManager.getFromSession({ req, key: 'selectedPrice' });
    if (response.success) {
      const day = req.body['plannedDeliveryDate-day'];
      const month = req.body['plannedDeliveryDate-month'];
      const year = req.body['plannedDeliveryDate-year'];
      const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
      const solution = {
        serviceRecipient: {
          name: serviceRecipientName,
          odsCode: selectedRecipientId,
        },
        catalogueSolutionId: selectedSolutionId,
        catalogueSolutionName: solutionName,
        deliveryDate: `${year}-${month.length === 1 ? '0' : ''}${month}-${day.length === 1 ? '0' : ''}${day}`,
        quantity: parseInt(req.body.quantity, 10),
        estimationPeriod: req.body.selectEstimationPeriod,
        provisioningType: 'Patient', // selectedPrice.provisioningType,
        type: 'Flat',
        currencyCode: 'GBP',
        itemUnitModel: selectedPrice.itemUnit,
        price: parseFloat(req.body.price),
      };
      postSolution({ orderId, accessToken, solution });
      logger.info('redirecting catalogue solutions main page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions`);
    }

    const context = await getOrderItemErrorPageContext({
      orderId,
      solutionName,
      selectedRecipientId,
      serviceRecipientName,
      selectedPrice,
      data: req.body,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
