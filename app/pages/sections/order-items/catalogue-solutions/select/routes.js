import express from 'express';
import sanitize from 'sanitize-filename';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import {
  getSolutionsErrorPageContext,
  getSolutionsPageContext,
  validateSolutionForm,
} from './solution/controller';
import {
  getSolutionPriceErrorPageContext,
  getSolutionPricePageContext,
  validateSolutionPriceForm,
} from './price/controller';
import {
  getSelectStatus,
  getServiceRecipientsContext,
  getServiceRecipientsErrorPageContext,
  getSelectSolutionPriceEndpoint,
  setContextIfBackFromCatalogueSolutionEdit,
} from './recipients/controller';
import {
  getDeliveryDateContext,
  validateDeliveryDateForm,
  getDeliveryDateErrorPageContext,
} from './date/controller';
import {
  formatFormData, getProvisionTypeOrderContext, getProvisionTypeOrderErrorContext,
} from '../order-item/flat/controller';
import {
  findSelectedCatalogueItemInSession,
} from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import {
  getCatalogueItems,
} from '../../../../../helpers/api/bapi/getCatalogueItems';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getSupplier } from '../../../../../helpers/api/ordapi/getSupplier';
import { getCommencementDate } from '../../../../../helpers/routes/getCommencementDate';
import { getServiceRecipients } from '../../../../../helpers/routes/getServiceRecipients';
import { putPlannedDeliveryDate } from '../../../../../helpers/api/ordapi/putPlannedDeliveryDate';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';
import { extractDate } from '../../../../../helpers/controllers/extractDate';
import { validateOrderItemTypeForm } from '../../../../../helpers/controllers/validateOrderItemTypeForm';
import { validateSolutionRecipientsForm } from '../../../../../helpers/controllers/validateSolutionRecipientsForm';
import manifest from './recipients/manifest.json';
import dateManifest from './date/manifest.json';

const router = express.Router({ mergeParams: true });

export const catalogueSolutionsSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution`);
  }));

  router.get('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedSolutionId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const supplierData = await getSupplier({ orderId, accessToken });
    const solutions = await getCatalogueItems({ supplierId: supplierData.supplierId, catalogueItemType: 'Solution' });
    sessionManager.saveToSession({ req, key: sessionKeys.solutions, value: solutions });

    const context = await getSolutionsPageContext({
      orderId, solutions, selectedSolutionId, odsCode,
    });

    const orderItems = sessionManager.getFromSession({ req, key: sessionKeys.orderItems });
    if (orderItems.length > 0) {
      sessionManager.saveToSession(
        { req, key: sessionKeys.selectedRecipients, value: undefined },
      );
      sessionManager.saveToSession(
        { req, key: sessionKeys.selectedQuantity, value: undefined },
      );
    }
    logger.info(`navigating to order ${orderId} catalogue-solutions select solution page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/solution/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const response = validateSolutionForm({ data: req.body });

    if (response.success) {
      const selectedItemId = req.body.selectSolution;
      const selectedItem = findSelectedCatalogueItemInSession({
        req,
        selectedItemId,
        sessionManager,
        catalogueItemsKey: 'solutions',
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

      if (existingItem.length > 0 && existingItem[0].catalogueItemId) {
        sessionManager.saveToSession({
          req, key: sessionKeys.catalogueItemExists, value: existingItem,
        });
        return res.redirect(
          `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/${existingItem[0].catalogueItemId}`,
        );
      }
      logger.info('redirecting catalogue solutions select price page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price`);
    }

    const solutions = sessionManager.getFromSession({ req, key: sessionKeys.solutions });
    const context = await getSolutionsErrorPageContext({
      orderId,
      solutions,
      validationErrors: response.errors,
      odsCode,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/select/solution/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedPriceId = Number(sessionManager.getFromSession({
      req, key: sessionKeys.selectedPriceId,
    }));
    const catalogueItemId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const selectedCatalogueItemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });

    const solutionPrices = await getCatalogueItemPricing({
      catalogueItemId,
      accessToken,
      loggerText: 'Catalogue solution',
    });
    sessionManager.saveToSession({ req, key: sessionKeys.solutionPrices, value: solutionPrices });

    if (((solutionPrices || {}).prices || {}).length === 1) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: solutionPrices.prices[0].priceId,
      });

      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price/recipients`);
    }

    const context = getSolutionPricePageContext({
      orderId,
      solutionPrices,
      selectedPriceId,
      selectedCatalogueItemName,
      odsCode,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions select price page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/price/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const response = validateSolutionPriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: req.body.selectSolutionPrice,
      });
      logger.info('redirecting catalogue solutions select recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price/recipients`);
    }

    const solutionPrices = sessionManager.getFromSession({
      req, key: sessionKeys.solutionPrices,
    });
    const context = await getSolutionPriceErrorPageContext({
      orderId,
      solutionPrices,
      validationErrors: response.errors,
      odsCode,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/select/price/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price/recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const { selectStatus } = req.query;

    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const solutionPrices = sessionManager.getFromSession({
      req, key: sessionKeys.solutionPrices,
    });

    const serviceRecipients = await getServiceRecipients({
      req,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
      sessionManager,
      logger,
      odsCode,
    });

    const selectedRecipients = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipients,
    });

    const context = await getServiceRecipientsContext({
      orderId,
      itemName,
      selectStatus: getSelectStatus({ selectStatus, selectedRecipients, serviceRecipients }),
      serviceRecipients,
      selectedRecipients,
      solutionPrices,
      manifest,
      orderType: 'catalogue-solutions',
      odsCode,
    });

    setContextIfBackFromCatalogueSolutionEdit(req, context, orderId, odsCode);

    logger.info(`navigating to order ${orderId} catalogue-solutions select recipient page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/recipients/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price/recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
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

      if (req.body.orderItemId) {
        logger.info('Back to catalogue solution page');
        return res.redirect(`${config.baseUrl}${getSelectSolutionPriceEndpoint(orderId, req.body.orderItemId, odsCode)}`);
      }

      logger.info('Redirect to planned delivery date page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price/recipients/date`);
    }
    if (!response.success) {
      const selectedRecipients = selected.map(([recipient]) => recipient);

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipients, value: selectedRecipients,
      });
    }
    const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });
    const serviceRecipients = sessionManager.getFromSession({ req, key: sessionKeys.recipients });
    const solutionPrices = sessionManager.getFromSession({ req, key: sessionKeys.solutionPrices });
    const selectedRecipients = sessionManager.getFromSession({
      req,
      key: sessionKeys.selectedRecipients,
    });

    const context = await getServiceRecipientsErrorPageContext({
      orderId,
      itemName,
      selectStatus: getSelectStatus({ selectStatus, selectedRecipients, serviceRecipients }),
      serviceRecipients,
      selectedRecipients,
      solutionPrices,
      validationErrors: response.errors,
      manifest,
    });

    setContextIfBackFromCatalogueSolutionEdit(req, context, orderId);

    return res.render('pages/sections/order-items/catalogue-solutions/select/recipients/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price/recipients/date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
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
      orderId, itemName, commencementDate, manifest: dateManifest, orderType: 'catalogue-solutions', odsCode,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions select planned delivery date page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/date/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price/recipients/date', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
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
      const solutionPrices = sessionManager.getFromSession({
        req, key: sessionKeys.solutionPrices,
      });
      const selectedPrice = solutionPrices.prices.filter(
        (obj) => obj.priceId === parseInt(priceId, 10),
      );
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPrice, value: selectedPrice[0],
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
          `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price/${selectedPrice[0].type.toLowerCase()}/${selectedPrice[0].provisioningType.toLowerCase()}`,
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

    return res.render('pages/sections/order-items/catalogue-solutions/select/date/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price/:priceType/:provisioningType', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const {
      orderId, odsCode, priceType, provisioningType,
    } = req.params;
    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const selectedPrice = sessionManager.getFromSession({
      req, key: sessionKeys.selectedPrice,
    });
    const quantity = sessionManager.getFromSession({
      req, key: sessionKeys.selectedQuantity,
    });
    const estimationPeriod = sessionManager.getFromSession({
      req, key: sessionKeys.selectEstimationPeriod,
    });
    const formData = {
      quantity,
      selectEstimationPeriod: estimationPeriod,
    };
    const context = await getProvisionTypeOrderContext({
      orderId,
      orderItemType: 'solution',
      selectedPrice,
      itemName,
      formData,
      odsCode,
    });
    logger.info(`navigating to order ${orderId} catalogue-solutions ${provisioningType} form`);
    if (priceType === 'flat' && provisioningType === 'patient') {
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/neworderitem`);
    }
    return res.render(`pages/sections/order-items/catalogue-solutions/order-item/${sanitize(priceType)}/template.njk`, addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price/:priceType/:provisioningType', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const {
      orderId, odsCode, orderItemId, priceType,
    } = req.params;
    const validationErrors = [];
    const formData = formatFormData({ formData: req.body });
    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const selectedPrice = sessionManager.getFromSession({
      req, key: sessionKeys.selectedPrice,
    });

    const errors = validateOrderItemTypeForm({
      orderItemType: 'solution',
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
      logger.info('Redirecting to the catalogue solution order item page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/neworderitem`);
    }

    const context = await getProvisionTypeOrderErrorContext({
      orderId,
      orderItemId,
      orderItemType: 'solution',
      itemName,
      selectedPrice,
      formData,
      validationErrors,
    });
    return res.render(`pages/sections/order-items/catalogue-solutions/order-item/${sanitize(priceType)}/template.njk`, addContext({ context, req, csrfToken: req.csrfToken() }));
  }));
  return router;
};
