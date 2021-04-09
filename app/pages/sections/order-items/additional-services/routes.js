import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import {
  getAdditionalServicesPageContext,
  setAdditionalServicesLinks,
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

    const pageData = await getOrderItemPageDataBulk({
      req,
      sessionManager,
      accessToken,
      orderId,
      orderItemId: catalogueItemId,
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

    sessionManager.saveToSession({
      req,
      key: sessionKeys.selectedRecipients,
      value: pageData.selectedRecipients,
    });

    setAdditionalServicesLinks(req, context, orderId, catalogueItemId, pageData.itemName);

    logger.info(`navigating to order ${orderId} additional-services order item page`);
    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk',
      addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = getPageData(req, sessionManager);
    const formData = formatFormData({ formData: req.body });
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
        selectedPrice: pageData.selectedPrice,
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
        return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services`);
      }

      const apiErrors = transformApiValidationResponse(apiResponse.errors);
      validationErrors.push(...apiErrors);
    }

    setEstimationPeriod(req, formData, sessionManager);

    const context = await getOrderItemErrorContext({
      orderId,
      catalogueItemId,
      orderItemType: 'AdditionalService',
      solutionName: pageData.itemName,
      selectedPrice: pageData.selectedPrice,
      deliveryDate: pageData.deliveryDate,
      recipients: pageData.recipients,
      selectedRecipients: pageData.selectedRecipients,
      formData,
      validationErrors,
    });
    context.backLinkHref = `${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipients/date`;

    return res.render('pages/sections/order-items/catalogue-solutions/order-item/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
