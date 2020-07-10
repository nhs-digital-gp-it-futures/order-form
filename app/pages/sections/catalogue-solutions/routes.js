import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routes/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import {
  getOrderItemContext,
  getOrderItemErrorPageContext,
  saveSolutionOrderItem,
} from './order-item/controller';
import { validateOrderItemForm } from '../../../helpers/controllers/validateOrderItemForm';
import { getPageData } from './order-item/routesHelper';
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

    const pageData = await getPageData({
      req,
      sessionManager,
      accessToken,
      orderId,
      orderItemId,
    });

    sessionManager.saveToSession({ req, key: 'orderItemPageData', value: pageData });

    const context = await getOrderItemContext({
      orderId,
      orderItemId,
      orderItemType: 'catalogue-solutions',
      solutionName: pageData.solutionName,
      odsCode: pageData.serviceRecipientId,
      serviceRecipientName: pageData.serviceRecipientName,
      selectedPrice: pageData.selectedPrice,
      formData: pageData.formData,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const validationErrors = [];

    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = sessionManager.getFromSession({ req, key: 'orderItemPageData' });

    const errors = validateOrderItemForm({
      orderItemType: 'catalogue-solutions',
      data: req.body,
      selectedPrice: pageData.selectedPrice,
    });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const apiResponse = await saveSolutionOrderItem({
        accessToken,
        orderId,
        orderItemId,
        selectedRecipientId: pageData.serviceRecipientId,
        serviceRecipientName: pageData.serviceRecipientName,
        selectedSolutionId: pageData.solutionId,
        solutionName: pageData.solutionName,
        selectedPrice: pageData.selectedPrice,
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
      orderItemId,
      orderItemType: 'catalogue-solutions',
      solutionName: pageData.solutionName,
      selectedRecipientId: pageData.serviceRecipientId,
      serviceRecipientName: pageData.serviceRecipientName,
      selectedPrice: pageData.selectedPrice,
      formData: req.body,
      validationErrors,
    });

    return res.render('pages/sections/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
