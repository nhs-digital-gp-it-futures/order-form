import express from 'express';
import sanitize from 'sanitize-filename';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import manifest from './recipients/manifest.json';
import dateManifest from './date/manifest.json';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getRecipients } from '../../../../../helpers/api/ordapi/getRecipients';
import {
  findAddedCatalogueSolutions,
  getAdditionalServicePageContext,
  getAdditionalServiceErrorPageContext,
  validateAdditionalServicesForm,
} from './additional-service/controller';
import {
  getAdditionalServicePricePageContext,
  getAdditionalServicePriceErrorPageContext,
  validateAdditionalServicePriceForm,
} from './price/controller';
import {
  getBackLinkHref,
  getAdditionalServiceRecipientPageContext,
  getAdditionalServiceRecipientErrorPageContext,
  validateAdditionalServiceRecipientForm,
  getAdditionalServiceRecipientName,
  getAdditionalServicePriceEndpoint,
  setContextIfBackFromAdditionalServiceEdit,
} from './recipient/controller';
import {
  getSelectStatus,
  getServiceRecipientsContext,
  getServiceRecipientsErrorPageContext,
} from '../../catalogue-solutions/select/recipients/controller';
import {
  getDeliveryDateContext,
  validateDeliveryDateForm,
  getDeliveryDateErrorPageContext,
} from '../../catalogue-solutions/select/date/controller';
import {
  getProvisionTypeOrderContext, getProvisionTypeOrderErrorContext, formatFormData,
} from '../../catalogue-solutions/order-item/flat/controller';
import {
  findSelectedCatalogueItemInSession,
} from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getAdditionalServices } from '../../../../../helpers/api/bapi/getAdditionalServices';
import { putPlannedDeliveryDate } from '../../../../../helpers/api/ordapi/putPlannedDeliveryDate';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';
import { extractDate } from '../../../../../helpers/controllers/extractDate';
import { validateOrderItemTypeForm } from '../../../../../helpers/controllers/validateOrderItemTypeForm';
import {
  getAdditionalServicesContextItems,
  getAdditionalServicesContextItemsFromSession,
  getAdditionalServicesPriceContextItemsFromSession,
} from '../../../../../helpers/routes/getAdditionalServicesContextItems';
import { validateSolutionRecipientsForm } from '../../../../../helpers/controllers/validateSolutionRecipientsForm';
import { getCommencementDate } from '../../../../../helpers/routes/getCommencementDate';

const router = express.Router({ mergeParams: true });

export const additionalServicesSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service`);
  }));

  router.get(
    '/additional-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => {
      const { orderId, odsCode } = req.params;
      const accessToken = extractAccessToken({ req, tokenType: 'access' });
      const addedCatalogueSolutions = await findAddedCatalogueSolutions({ orderId, accessToken });
      const additionalServices = await getAdditionalServices({
        addedCatalogueSolutions,
        accessToken,
      });

      if (additionalServices.length === 0) {
        throw new ErrorContext({
          status: 404,
          title: 'No Additional Services found',
          description: 'There are no Additional Services offered by this supplier. Go back to the Additional Services dashboard and select continue to complete the section.',
          backLinkText: 'Go back',
          backLinkHref: `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`,
        });
      }

      const selectedAdditionalServiceId = sessionManager.getFromSession({
        req, key: sessionKeys.selectedItemId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.additionalServices, value: additionalServices,
      });

      const context = getAdditionalServicePageContext({
        orderId,
        additionalServices,
        selectedAdditionalServiceId,
        odsCode,
      });

      const orderItems = sessionManager.getFromSession({ req, key: sessionKeys.orderItems });
      if (orderItems && orderItems.length > 0) {
        sessionManager.saveToSession(
          { req, key: sessionKeys.selectedRecipients, value: undefined },
        );
        sessionManager.saveToSession(
          { req, key: sessionKeys.selectedQuantity, value: undefined },
        );
      }
      logger.info(`navigating to order ${orderId} additional-services select additional-service page`);
      return res.render('pages/sections/order-items/additional-services/select/additional-service/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
    }),
  );

  router.post('/additional-service', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const response = validateAdditionalServicesForm({ data: req.body });

    if (response.success) {
      const selectedItemId = req.body.selectAdditionalService;
      const selectedItem = findSelectedCatalogueItemInSession({
        req,
        selectedItemId,
        sessionManager,
        catalogueItemsKey: sessionKeys.additionalServices,
      });

      const orderItems = sessionManager.getFromSession({ req, key: sessionKeys.orderItems });
      const existingItem = orderItems
        .filter((orderItem) => orderItem.catalogueItemId === selectedItem.catalogueItemId);

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedItemId, value: selectedItemId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedItemName, value: selectedItem.name,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedCatalogueSolutionId, value: selectedItem.solution.solutionId,
      });

      if (existingItem.length > 0 && existingItem[0].catalogueItemId) {
        sessionManager.saveToSession({
          req, key: sessionKeys.catalogueItemExists, value: existingItem,
        });
        return res.redirect(
          `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/${existingItem[0].catalogueItemId}`,
        );
      }

      logger.info('redirecting additional services select price page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price`);
    }

    const additionalServices = sessionManager.getFromSession({
      req, key: sessionKeys.additionalServices,
    });
    const context = await getAdditionalServiceErrorPageContext({
      orderId,
      additionalServices,
      validationErrors: response.errors,
    });

    return res.render(
      'pages/sections/order-items/additional-services/select/additional-service/template.njk',
      addContext({ context, req, csrfToken: req.csrfToken() }),
    );
  }));

  router.get('/additional-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedPriceId = Number(sessionManager.getFromSession({
      req, key: sessionKeys.selectedPriceId,
    }));
    const catalogueItemId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const selectedAdditionalServiceName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });

    const additionalServicePrices = await getCatalogueItemPricing({
      catalogueItemId,
      accessToken,
      loggerText: 'Additional service',
    });

    sessionManager.saveToSession({
      req, key: sessionKeys.additionalServicePrices, value: additionalServicePrices,
    });

    if (((additionalServicePrices || {}).prices || {}).length === 1) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: additionalServicePrices.prices[0].priceId,
      });

      logger.info('redirecting to additional services select recipients page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`);
    }

    const context = getAdditionalServicePricePageContext({
      orderId,
      additionalServicePrices,
      selectedPriceId,
      selectedAdditionalServiceName,
      odsCode,
    });

    logger.info(`navigating to order ${orderId} additional-services select price page`);
    return res.render('pages/sections/order-items/additional-services/select/price/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const response = validateAdditionalServicePriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: req.body.selectAdditionalServicePrice,
      });
      logger.info('redirecting to additional services select recipients page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`);
    }

    const selectedAdditionalServiceName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const additionalServicePrices = sessionManager.getFromSession({
      req, key: sessionKeys.additionalServicePrices,
    });
    const context = await getAdditionalServicePriceErrorPageContext({
      orderId,
      additionalServicePrices,
      selectedAdditionalServiceName,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/additional-services/select/price/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/additional-service/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });
    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: sessionKeys.recipients, value: recipients });

    const selectedAdditionalRecipientId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipientId,
    });

    const additionalServicePrices = sessionManager.getFromSession({
      req, key: sessionKeys.additionalServicePrices,
    });

    const context = await getAdditionalServiceRecipientPageContext({
      orderId,
      itemName,
      recipients,
      selectedAdditionalRecipientId,
      additionalServicePrices,
      odsCode,
    });

    logger.info(`navigating to order ${orderId} additional-services select recipient page`);
    return res.render('pages/sections/order-items/additional-services/select/recipient/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const recipients = sessionManager.getFromSession({ req, key: sessionKeys.recipients });

    const response = validateAdditionalServiceRecipientForm({ data: req.body });
    if (response.success) {
      const selectedRecipientId = req.body.selectRecipient;
      const selectedRecipientName = getAdditionalServiceRecipientName(
        { serviceRecipientId: selectedRecipientId, recipients },
      );
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipientId, value: selectedRecipientId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipientName, value: selectedRecipientName,
      });
      logger.info('Redirect to new additional service order item page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/neworderitem`);
    }

    const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });

    const context = await getAdditionalServiceRecipientErrorPageContext({
      orderId,
      itemName,
      recipients,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/additional-services/select/recipient/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/additional-service/price/recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const { selectStatus } = req.query;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: sessionKeys.recipients, value: recipients });

    const {
      serviceRecipients, selectedRecipients, additionalServicePrices, itemName,
    } = await getAdditionalServicesContextItems({
      req, sessionManager, accessToken, logger, odsCode,
    });

    const context = await getServiceRecipientsContext({
      orderId,
      itemName,
      selectStatus: getSelectStatus({ selectStatus, selectedRecipients, serviceRecipients }),
      serviceRecipients,
      selectedRecipients,
      additionalServicePrices,
      manifest,
      orderType: 'additional-services',
      odsCode,
    });

    context.backLinkHref = getBackLinkHref(req, additionalServicePrices, orderId, odsCode);
    context.selectDeselectButtonAction = `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`;

    setContextIfBackFromAdditionalServiceEdit(req, context, orderId, odsCode);

    logger.info(`navigating to order ${orderId} additional-services select recipients page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/recipients/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price/recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const { selectStatus } = req.query;

    const selected = Object
      .entries(req.body)
      .filter((item) => item[0] !== '_csrf' && item[0] !== 'orderItemId');

    const response = validateSolutionRecipientsForm({ data: selected });

    if (response.success) {
      const selectedRecipients = selected.map(([recipient]) => recipient);

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipients, value: selectedRecipients,
      });

      const { orderItemId } = req.body;
      if (orderItemId) {
        logger.info('Redirect to additional services page');
        return res.redirect(`${config.baseUrl}${getAdditionalServicePriceEndpoint(orderId, orderItemId, odsCode)}?submitted=${orderItemId}`);
      }

      logger.info('Redirect to planned delivery date page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients/date`);
    }
    if (!response.success) {
      const selectedRecipients = selected.map(([recipient]) => recipient);

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipients, value: selectedRecipients,
      });
    }

    const {
      serviceRecipients, selectedRecipients, additionalServicePrices, itemName,
    } = await getAdditionalServicesContextItemsFromSession({ req, sessionManager });

    const context = await getServiceRecipientsErrorPageContext({
      orderId,
      itemName,
      selectStatus: getSelectStatus({ selectStatus, selectedRecipients, serviceRecipients }),
      serviceRecipients,
      selectedRecipients,
      additionalServicePrices,
      validationErrors: response.errors,
      manifest,
    });

    context.backLinkHref = getBackLinkHref(req, additionalServicePrices, orderId, odsCode);
    context.selectDeselectButtonAction = `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`;

    setContextIfBackFromAdditionalServiceEdit(req, context, orderId, odsCode);

    return res.render(
      'pages/sections/order-items/catalogue-solutions/select/recipients/template.njk',
      addContext({ context, req, csrfToken: req.csrfToken() }),
    );
  }));

  router.get('/additional-service/price/recipients/date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });

    const commencementDate = await getCommencementDate({
      req,
      sessionManager,
      accessToken,
      logger,
    });

    const context = await getDeliveryDateContext({
      orderId, itemName, commencementDate, manifest: dateManifest, orderType: 'additional-services',
    });

    context.backLinkHref = `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`;

    logger.info(`navigating to order ${orderId} additional-services select planned delivery date page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/date/template.njk',
      addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price/recipients/date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const validationErrors = [];
    const errors = validateDeliveryDateForm({ data: req.body });
    validationErrors.push(...errors);

    if (validationErrors.length === 0) {
      const catalogueItemId = sessionManager.getFromSession({
        req, key: sessionKeys.selectedItemId,
      });

      const priceId = sessionManager.getFromSession({
        req, key: sessionKeys.selectedPriceId,
      });
      const additionalServicePrices = sessionManager.getFromSession({
        req, key: sessionKeys.additionalServicePrices,
      });

      const additionalServiceSelectedPrice = additionalServicePrices.prices.filter(
        (obj) => obj.priceId === parseInt(priceId, 10),
      );
      sessionManager.saveToSession({
        req,
        key: sessionKeys.additionalServiceSelectedPrice,
        value: additionalServiceSelectedPrice[0],
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.plannedDeliveryDate, value: extractDate('deliveryDate', req.body),
      });

      const apiResponse = await putPlannedDeliveryDate({
        orderId,
        catalogueItemId,
        data: req.body,
        accessToken: extractAccessToken({ req, tokenType: 'access' }),
      });
      if (apiResponse.success) {
        return res.redirect(
          `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/${additionalServiceSelectedPrice[0].type.toLowerCase()}/${additionalServiceSelectedPrice[0].provisioningType.toLowerCase()}`,
        );
      }
      validationErrors.push(...apiResponse.errors);
    }

    const itemName = sessionManager.getFromSession({
      req,
      key: sessionKeys.selectedItemName,
    });

    const context = await getDeliveryDateErrorPageContext({
      validationErrors,
      orderId,
      itemName,
      data: req.body,
      manifest: dateManifest,
    });
    context.backLinkHref = `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`;

    return res.render('pages/sections/order-items/catalogue-solutions/select/date/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/additional-service/price/:priceType/:provisioningType', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const {
      orderId, priceType, provisioningType, odsCode,
    } = req.params;

    const {
      formData, itemName, selectedPrice,
    } = getAdditionalServicesPriceContextItemsFromSession({ req, sessionManager });

    const context = await getProvisionTypeOrderContext({
      orderId,
      orderItemType: 'additionalservice',
      selectedPrice,
      itemName,
      formData,
      odsCode,
    });
    context.backLinkHref = `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients/date`;

    logger.info(`navigating to order ${orderId} additional services ${provisioningType} form`);
    if (priceType === 'flat' && provisioningType === 'patient') {
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/neworderitem`);
    }

    return res.render(`pages/sections/order-items/catalogue-solutions/order-item/${sanitize(priceType)}/template.njk`, addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price/:priceType/:provisioningType', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const {
      orderId, orderItemId, priceType, odsCode,
    } = req.params;
    const validationErrors = [];
    const formData = formatFormData({ formData: req.body });
    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const selectedPrice = sessionManager.getFromSession({
      req, key: sessionKeys.additionalServiceSelectedPrice,
    });

    const errors = validateOrderItemTypeForm({
      orderItemType: 'additionalservice',
      data: req.body,
      selectedPrice,
    });
    validationErrors.push(...errors);
    if (validationErrors.length === 0) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedQuantity, value: formData.quantity,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectEstimationPeriod, value: formData.selectEstimationPeriod,
      });
      logger.info('Redirecting to the additional services order item page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/neworderitem`);
    }

    const context = await getProvisionTypeOrderErrorContext({
      orderId,
      orderItemId,
      orderItemType: 'additionalservice',
      itemName,
      selectedPrice,
      formData,
      validationErrors,
    });
    return res.render(`pages/sections/order-items/catalogue-solutions/order-item/${sanitize(priceType)}/template.njk`, addContext({ context, req, csrfToken: req.csrfToken() }));
  }));
  return router;
};
