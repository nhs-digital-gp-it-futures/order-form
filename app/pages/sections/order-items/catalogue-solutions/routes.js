import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import {
  getCatalogueSolutionsPageContext,
} from './dashboard/controller';
import { catalogueSolutionsSelectRoutes } from './select/routes';
import {
  getOrderItemContext,
  getOrderItemErrorPageContext,
} from './edit-solution/controller';
import { validateOrderItemForm } from '../../../../helpers/controllers/validateOrderItemForm';
import { getOrderItemPageData } from '../../../../helpers/routes/getOrderItemPageData';
import { saveOrderItem } from '../../../../helpers/controllers/saveOrderItem';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';

const router = express.Router({ mergeParams: true });

export const catalogueSolutionsRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getCatalogueSolutionsPageContext({
      req,
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
      sessionManager,
      logger,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions dashboard page`);
    return res.render('pages/sections/order-items/catalogue-solutions/dashboard/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putOrderSection({
      orderId,
      sectionId: 'catalogue-solutions',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.use('/select', catalogueSolutionsSelectRoutes(authProvider, addContext, sessionManager));

  router.get('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const pageData = await getOrderItemPageData({
      req,
      sessionManager,
      accessToken,
      orderId,
      orderItemId,
    });

    sessionManager.saveToSession({ req, key: sessionKeys.orderItemPageData, value: pageData });

    const context = await getOrderItemContext({
      orderId,
      orderItemId,
      orderItemType: 'Solution',
      solutionName: pageData.itemName,
      odsCode: pageData.serviceRecipientId,
      serviceRecipientName: pageData.serviceRecipientName,
      selectedPrice: pageData.selectedPrice,
      formData: pageData.formData,
      deliveryDate: pageData.deliveryDate,
      recipients: pageData.recipients,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/order-items/catalogue-solutions/edit-solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const validationErrors = [];

    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = sessionManager.getFromSession({ req, key: sessionKeys.orderItemPageData });

    const errors = validateOrderItemForm({
      orderItemType: 'Solution',
      data: req.body,
      selectedPrice: pageData.selectedPrice,
    });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const apiResponse = await saveOrderItem({
        accessToken,
        orderId,
        orderItemId,
        orderItemType: 'Solution',
        serviceRecipientId: pageData.serviceRecipientId,
        serviceRecipientName: pageData.serviceRecipientName,
        itemId: pageData.itemId,
        itemName: pageData.itemName,
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
      orderItemType: 'Solution',
      solutionName: pageData.itemName,
      selectedRecipientId: pageData.serviceRecipientId,
      serviceRecipientName: pageData.serviceRecipientName,
      selectedPrice: pageData.selectedPrice,
      formData: req.body,
      validationErrors,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
