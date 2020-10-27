import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import {
  getCatalogueSolutionsPageContext,
} from './dashboard/controller';
import { catalogueSolutionsSelectRoutes } from './select/routes';
import {
  formatFormData,
  getOrderItemContext,
  getOrderItemErrorContext,
} from './order-item/controller';
import { validateOrderItemFormBulk } from '../../../../helpers/controllers/validateOrderItemFormBulk';
import { getOrderItemPageDataBulk } from '../../../../helpers/routes/getOrderItemPageDataBulk';
import { saveOrderItemBulk } from '../../../../helpers/controllers/saveOrderItemBulk';
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

    const pageData = await getOrderItemPageDataBulk({
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
      selectedPrice: pageData.selectedPrice,
      formData: pageData.formData,
      deliveryDate: pageData.deliveryDate,
      recipients: pageData.recipients,
      selectedRecipients: pageData.selectedRecipients,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions order item page`);
    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:orderItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, orderItemId } = req.params;
    const validationErrors = [];

    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = sessionManager.getFromSession({ req, key: sessionKeys.orderItemPageData });

    const formData = formatFormData({ formData: req.body });

    const errors = validateOrderItemFormBulk({
      orderItemType: 'Solution',
      data: formData,
      selectedPrice: pageData.selectedPrice,
    });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const apiResponse = await saveOrderItemBulk({
        accessToken,
        orderId,
        orderItemId,
        orderItemType: 'Solution',
        serviceRecipientId: pageData.serviceRecipientId,
        serviceRecipientName: pageData.serviceRecipientName,
        itemId: pageData.itemId,
        itemName: pageData.itemName,
        selectedPrice: pageData.selectedPrice,
        recipients: pageData.recipients,
        selectedRecipients: pageData.selectedRecipients,
        formData,
      });

      if (apiResponse.success) {
        logger.info('redirecting catalogue solutions main page');
        return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions`);
      }
      validationErrors.push(...apiResponse.errors);
    }

    const context = await getOrderItemErrorContext({
      orderId,
      orderItemId,
      orderItemType: 'Solution',
      solutionName: pageData.itemName,
      selectedPrice: pageData.selectedPrice,
      deliveryDate: pageData.deliveryDate,
      recipients: pageData.recipients,
      selectedRecipients: pageData.selectedRecipients,
      formData,
      validationErrors,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
