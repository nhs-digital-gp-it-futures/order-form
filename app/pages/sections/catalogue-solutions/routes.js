import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import {
  getOrderItemContext, getRecipientName, getOrderItemErrorPageContext, validateOrderItemForm,
} from './order-item/controller';
import { getSolution } from './select/recipient/controller';
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
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const selectedRecipientId = 'odsId';
    // const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });

    const solutionName = 'solution-name';
    // const solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
    sessionManager.saveToSession({ req, key: 'solutionName', value: solutionName });

    const serviceRecipientName = 'recipient-name';
    // const serviceRecipientName = await getRecipientName({ selectedRecipientId, accessToken });
    sessionManager.saveToSession({ req, key: 'serviceRecipientName', value: serviceRecipientName });
    
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });
    // const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const selectedPrice = {
      priceId: 2,
      provisioningType: 'Patient', // Patient, Declarative
      type: 'flat',
      currencyCode: 'GBP', // ISO Currency Code
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    };
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

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    logger.info('posting things');

    const response = validateOrderItemForm({ data: req.body });
    if (response.success) {
      logger.info('redirecting catalogue solutions main page');
      // return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions`);
    }
    const solutionName = sessionManager.getFromSession({ req, key: 'solutionName' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'serviceRecipientName' });
    const selectedPrice = sessionManager.getFromSession({ req, key: 'selectedPrice' });

    const context = await getOrderItemErrorPageContext({
      orderId,
      solutionName,
      serviceRecipientName,
      selectedPrice,
      data: req.body,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
