import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import {
  getAdditionalServicesPageContext,
  updateContext,
  updateContextPost,
} from './dashboard/controller';
import { additionalServicesSelectRoutes } from './select/routes';
import {
  getOrderItemContext as getOrderItemRecipientsContext,
  formatFormData, getOrderItemErrorContext, getPageData, setEstimationPeriod,
} from '../catalogue-solutions/order-item/controller';
import { validateOrderItemFormBulk } from '../../../../helpers/controllers/validateOrderItemFormBulk';
import { getOrderItemPageDataBulk } from '../../../../helpers/routes/getOrderItemPageDataBulk';
import { saveOrderItemBulk } from '../../../../helpers/controllers/saveOrderItemBulk';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';
import { transformApiValidationResponse } from '../../../../helpers/common/transformApiValidationResponse';

const router = express.Router({ mergeParams: true });

export const additionalServicesRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const context = await getAdditionalServicesPageContext({
      req,
      orderId,
      catalogueItemType: 'AdditionalService',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
      sessionManager,
      logger,
      odsCode,
    });

    sessionManager.saveToSession(
      { req, key: sessionKeys.selectedRecipients, value: undefined },
    );
    sessionManager.saveToSession(
      { req, key: sessionKeys.recipients, value: undefined },
    );
    sessionManager.saveToSession(
      { req, key: sessionKeys.catalogueItemExists, value: undefined },
    );
    sessionManager.saveToSession(
      { req, key: sessionKeys.orderItems, value: context.orderItems },
    );

    logger.info(`navigating to order ${orderId} additional-services dashboard page`);
    return res.render('pages/sections/order-items/additional-services/dashboard/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    await putOrderSection({
      orderId,
      sectionId: 'additional-services',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}`);
  }));

  router.use('/select', additionalServicesSelectRoutes(authProvider, addContext, sessionManager));

  router.get('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const pageData = await getOrderItemPageDataBulk({
      req,
      sessionManager,
      accessToken,
      orderId,
      orderItemId: catalogueItemId,
    });
    const { selectedPrice } = pageData;
    sessionManager.saveToSession({ req, key: sessionKeys.orderItemPageData, value: pageData });
    const catalogueItemExists = sessionManager.getFromSession({
      req, key: sessionKeys.catalogueItemExists,
    });

    const context = await getOrderItemRecipientsContext({
      orderId,
      orderItemId: catalogueItemId,
      orderItemType: 'AdditionalService',
      solutionName: pageData.itemName,
      selectedPrice,
      formData: pageData.formData,
      recipients: pageData.recipients,
      selectedRecipients: pageData.selectedRecipients || [],
      odsCode,
    });

    sessionManager.saveToSession(
      { req, key: sessionKeys.selectedItemName, value: pageData.itemName },
    );
    sessionManager.saveToSession({
      req,
      key: sessionKeys.selectedRecipients,
      value: pageData.selectedRecipients,
    });

    updateContext({
      req,
      selectedPrice,
      context,
      orderId,
      catalogueItemId,
      solutionName: pageData.itemName,
      catalogueItemExists,
      odsCode,
    });

    logger.info(`navigating to order ${orderId} additional-services order item page`);
    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk',
      addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = getPageData(req, sessionManager);
    const formData = formatFormData({ formData: req.body });
    const { selectedPrice } = pageData;
    const validationErrors = validateOrderItemFormBulk({
      orderItemType: 'AdditionalService',
      data: formData,
      selectedPrice: pageData.selectedPrice,
    });

    if (validationErrors.length === 0) {
      const apiResponse = await saveOrderItemBulk({
        accessToken,
        orderId,
        orderItemId: catalogueItemId,
        orderItemType: 'AdditionalService',
        serviceRecipientId: pageData.serviceRecipientId,
        serviceRecipientName: pageData.serviceRecipientName,
        itemId: pageData.itemId,
        itemName: pageData.itemName,
        catalogueSolutionId: pageData.catalogueSolutionId,
        selectedPrice,
        recipients: pageData.recipients,
        selectedRecipients: pageData.selectedRecipients,
        formData,
      });

      if (apiResponse.success) {
        logger.info('Redirecting to the additional-services main page');
        sessionManager.saveToSession({ req, key: sessionKeys.solutions, value: undefined });
        sessionManager.saveToSession({ req, key: sessionKeys.selectedItemId, value: undefined });
        sessionManager.saveToSession({ req, key: sessionKeys.solutionPrices, value: undefined });
        sessionManager.saveToSession({ req, key: sessionKeys.selectedPriceId, value: undefined });
        sessionManager.saveToSession(
          { req, key: sessionKeys.selectedRecipients, value: undefined },
        );
        sessionManager.saveToSession(
          { req, key: sessionKeys.plannedDeliveryDate, value: undefined },
        );
        return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`);
      }

      const apiErrors = transformApiValidationResponse(apiResponse.errors);
      validationErrors.push(...apiErrors);
    }

    setEstimationPeriod(req, formData, sessionManager);

    const context = await getOrderItemErrorContext({
      orderId,
      orderItemId: catalogueItemId,
      orderItemType: 'AdditionalService',
      solutionName: pageData.itemName,
      selectedPrice,
      deliveryDate: pageData.deliveryDate,
      recipients: pageData.recipients,
      selectedRecipients: pageData.selectedRecipients,
      formData,
      validationErrors,
    });

    updateContextPost({
      req, selectedPrice, context, orderId, solutionName: pageData.itemName, odsCode,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  return router;
};
