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
  getOrderItem,
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
    let selectedSolutionId;
    let selectedPriceId;
    let selectedPrice;
    let solutionName;
    let selectedRecipientId;
    let serviceRecipientName;
    let formData;

    if (orderItemId === 'newsolution') {
      selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
      solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
      selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
      serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
      selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });
      selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
      formData = { price: selectedPrice.price };
    } else {
      selectedPrice = await getOrderItem({ orderId, orderItemId, accessToken });
      solutionName = selectedPrice.catalogueItemName;
      selectedRecipientId = selectedPrice.serviceRecipient.odsCode;
      sessionManager.saveToSession({ req, key: 'selectedRecipientId', value: selectedRecipientId });
      serviceRecipientName = selectedPrice.serviceRecipient.name;
      sessionManager.saveToSession({ req, key: 'serviceRecipientName', value: serviceRecipientName });
      const date = selectedPrice.deliveryDate.split('-');
      formData = {
        'deliveryDate-year': date[0],
        'deliveryDate-month': date[1],
        'deliveryDate-day': date[2],
        quantity: selectedPrice.quantity,
        selectEstimationPeriod: selectedPrice.estimationPeriod,
        price: selectedPrice.price,
      };
    }

    sessionManager.saveToSession({ req, key: 'solutionName', value: solutionName });
    sessionManager.saveToSession({ req, key: 'selectedPrice', value: selectedPrice });

    const context = await getOrderItemContext({
      orderId,
      orderItemId,
      solutionName,
      odsCode: selectedRecipientId,
      serviceRecipientName,
      selectedPrice,
      formData,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const validationErrors = [];

    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const solutionName = sessionManager.getFromSession({ req, key: 'solutionName' });
    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPrice = sessionManager.getFromSession({ req, key: 'selectedPrice' });
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });

    const errors = validateOrderItemForm({ data: req.body, selectedPrice });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const apiResponse = await postSolutionOrderItem({
        orderId,
        accessToken,
        selectedRecipientId,
        serviceRecipientName,
        selectedSolutionId,
        solutionName,
        selectedPrice,
        formData: req.body,
      });

      if (apiResponse.success) {
        logger.info('redirecting catalogue solutions main page');
        return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions`);
      }
      validationErrors.push(...apiResponse.errors);
    }

    const context = await getOrderItemErrorPageContext({
      orderId,
      solutionName,
      selectedRecipientId,
      serviceRecipientName,
      selectedPrice,
      formData: req.body,
      validationErrors,
    });

    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
