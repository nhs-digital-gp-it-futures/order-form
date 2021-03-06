import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routes/routerHelper';
import {
  getAssociatedServicesPageContext,
} from './dashboard/controller';
import { associatedServicesSelectRoutes } from './select/routes';
import {
  getBackLinkHref,
  formatFormData,
  getOrderItemContext,
  getOrderItemErrorPageContext,
} from './order-item/controller';
import { validateOrderItemForm } from '../../../../helpers/controllers/validateOrderItemForm';
import { getOrderItemPageData } from '../../../../helpers/routes/getOrderItemPageData';
import { saveOrderItem } from '../../../../helpers/controllers/saveOrderItem';
import { putOrderSection } from '../../../../helpers/api/ordapi/putOrderSection';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';
import { getOrganisationFromOdsCode } from '../../../../helpers/controllers/odsCodeLookup';
import { transformApiValidationResponse } from '../../../../helpers/common/transformApiValidationResponse';

const router = express.Router({ mergeParams: true });

export const associatedServicesRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const context = await getAssociatedServicesPageContext({
      req,
      orderId,
      catalogueItemType: 'AssociatedService',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
      sessionManager,
      logger,
      odsCode,
    });

    sessionManager.saveToSession(
      { req, key: sessionKeys.catalogueItemExists, value: undefined },
    );
    sessionManager.saveToSession(
      { req, key: sessionKeys.orderItems, value: context.orderItems },
    );

    logger.info(`navigating to order ${orderId} associated-services dashboard page`);
    return res.render('pages/sections/order-items/associated-services/dashboard/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.use('/select', associatedServicesSelectRoutes(authProvider, addContext, sessionManager));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    await putOrderSection({
      orderId,
      sectionId: 'associated-services',
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}`);
  }));

  router.use('/select', associatedServicesSelectRoutes(authProvider, addContext));

  router.get('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const pageData = await getOrderItemPageData({
      req,
      sessionManager,
      accessToken,
      orderId,
      catalogueItemId,
    });

    sessionManager.saveToSession({
      req, key: sessionKeys.orderItemPageData, value: pageData,
    });
    const associatedServicePrices = sessionManager.getFromSession({
      req, key: sessionKeys.associatedServicePrices,
    });

    const context = await getOrderItemContext({
      orderId,
      catalogueItemId,
      orderItemType: 'AssociatedService',
      itemName: pageData.itemName,
      selectedPrice: pageData.selectedPrice,
      formData: pageData.formData,
      odsCode,
    });

    context.backLinkHref = getBackLinkHref(req, associatedServicePrices, orderId, odsCode);

    logger.info(`navigating to order ${orderId} associated-services order item page`);
    return res.render('pages/sections/order-items/associated-services/order-item/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/:catalogueItemId', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, catalogueItemId, odsCode } = req.params;
    const validationErrors = [];

    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const pageData = sessionManager.getFromSession({ req, key: sessionKeys.orderItemPageData });

    const formData = formatFormData({ formData: req.body });

    const errors = validateOrderItemForm({
      orderItemType: 'AssociatedService',
      data: formData,
      selectedPrice: pageData.selectedPrice,
    });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const orgData = await getOrganisationFromOdsCode({
        req, sessionManager, odsCode, accessToken,
      });

      const apiResponse = await saveOrderItem({
        accessToken,
        orderId,
        orderItemType: 'AssociatedService',
        itemId: pageData.itemId,
        itemName: pageData.itemName,
        selectedPrice: pageData.selectedPrice,
        formData,
        serviceRecipientId: orgData.odsCode,
        serviceRecipientName: orgData.name,
      });

      if (apiResponse.success) {
        logger.info('Redirecting to the associated-services main page');
        sessionManager.saveToSession({ req, key: sessionKeys.selectedItemId, value: undefined });
        return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services`);
      }

      const apiErrors = transformApiValidationResponse(apiResponse.errors);
      validationErrors.push(...apiErrors);
    }

    const associatedServicePrices = sessionManager.getFromSession({
      req, key: sessionKeys.associatedServicePrices,
    });

    const context = await getOrderItemErrorPageContext({
      orderId,
      catalogueItemId,
      orderItemType: 'AssociatedService',
      itemName: pageData.itemName,
      selectedPrice: pageData.selectedPrice,
      formData: req.body,
      validationErrors,
      odsCode,
    });
    context.backLinkHref = getBackLinkHref(req, associatedServicePrices, orderId, odsCode);

    return res.render('pages/sections/order-items/associated-services/order-item/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  return router;
};
