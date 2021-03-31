import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import {
  getAdditionalServicesPageContext,
} from './dashboard/controller';
import { additionalServicesSelectRoutes } from './select/routes';
import {
  formatFormData,
  getOrderItemErrorPageContext,
} from './order-item/controller';
import { getOrderItemContext as getOrderItemRecipientsContext } from '../catalogue-solutions/order-item/controller';
import { validateOrderItemForm } from '../../../../helpers/controllers/validateOrderItemForm';
import { getOrderItemRecipientsPageData } from '../../../../helpers/routes/getOrderItemPageData';
import { saveOrderItem } from '../../../../helpers/controllers/saveOrderItem';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';
import { transformApiValidationResponse } from '../../../../helpers/common/transformApiValidationResponse';

const router = express.Router({ mergeParams: true });

export const additionalServicesRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getAdditionalServicesPageContext({
      req,
      orderId,
      catalogueItemType: 'AdditionalService',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
      sessionManager,
      logger,
    });

    logger.info(`navigating to order ${orderId} additional-services dashboard page`);
    return res.render('pages/sections/order-items/additional-services/dashboard/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putOrderSection({
      orderId,
      sectionId: 'additional-services',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.use('/select', additionalServicesSelectRoutes(authProvider, addContext, sessionManager));

  router.get('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const pageData = await getOrderItemRecipientsPageData({
      req,
      sessionManager,
      accessToken,
      orderId,
      catalogueItemId,
    });
    pageData.selectedPrice = sessionManager.getFromSession({
      req, key: sessionKeys.additionalServiceSelectedPrice,
    });

    sessionManager.saveToSession({ req, key: sessionKeys.orderItemPageData, value: pageData });

    const context = await getOrderItemRecipientsContext({
      orderId,
      orderItemId: catalogueItemId,
      orderItemType: 'AdditionalService',
      solutionName: pageData.itemName,
      selectedPrice: pageData.selectedPrice,
      formData: pageData.formData,
      recipients: pageData.recipients,
      selectedRecipients: pageData.selectedRecipients || [],
    });
    context.backLinkHref = `${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipients/date`;

    logger.info(`navigating to order ${orderId} additional-services order item page`);
    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk',
      addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId } = req.params;
    const validationErrors = [];

    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = sessionManager.getFromSession({ req, key: sessionKeys.orderItemPageData });

    const formData = formatFormData({ formData: req.body });

    const errors = validateOrderItemForm({
      orderItemType: 'AdditionalService',
      data: formData,
      selectedPrice: pageData.selectedPrice,
    });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const apiResponse = await saveOrderItem({
        accessToken,
        orderId,
        orderItemType: 'AdditionalService',
        serviceRecipientId: pageData.serviceRecipientId,
        serviceRecipientName: pageData.serviceRecipientName,
        itemId: pageData.itemId,
        itemName: pageData.itemName,
        catalogueSolutionId: pageData.catalogueSolutionId,
        selectedPrice: pageData.selectedPrice,
        formData,
      });

      if (apiResponse.success) {
        logger.info('Redirecting to the additional-services main page');
        return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services`);
      }

      const apiErrors = transformApiValidationResponse(apiResponse.errors);
      validationErrors.push(...apiErrors);
    }

    const context = await getOrderItemErrorPageContext({
      orderId,
      catalogueItemId,
      orderItemType: 'AdditionalService',
      itemName: pageData.itemName,
      serviceRecipientId: pageData.serviceRecipientId,
      serviceRecipientName: pageData.serviceRecipientName,
      selectedPrice: pageData.selectedPrice,
      formData: req.body,
      validationErrors,
    });

    return res.render('pages/sections/order-items/additional-services/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
