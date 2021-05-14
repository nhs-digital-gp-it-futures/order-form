import express from 'express';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import {
  getAssociatedServicePageContext,
  getAssociatedServiceErrorPageContext,
  findAssociatedServices,
  validateAssociatedServicesForm,
} from './associated-service/controller';
import {
  getAssociatedServicePricePageContext,
  getAssociatedServicePriceErrorPageContext,
  validateAssociatedServicePriceForm,
} from './price/controller';
import { findSelectedCatalogueItemInSession } from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

const router = express.Router({ mergeParams: true });

export const associatedServicesSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/select/associated-service`);
  }));

  router.get(
    '/associated-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => {
      const { orderId, odsCode } = req.params;
      const accessToken = extractAccessToken({ req, tokenType: 'access' });
      const associatedServices = await findAssociatedServices({
        req,
        accessToken,
        sessionManager,
        logger,
      });

      if (associatedServices.length === 0) {
        throw new ErrorContext({
          status: 404,
          title: 'No Associated Services found',
          description: 'There are no Associated Services offered by this supplier. Go back to the Associated Services dashboard and select continue to complete the section.',
          backLinkText: 'Go back',
          backLinkHref: `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services`,
        });
      }

      const selectedAssociatedServiceId = sessionManager.getFromSession({
        req, key: sessionKeys.selectedItemId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.associatedServices, value: associatedServices,
      });

      const context = getAssociatedServicePageContext({
        orderId,
        associatedServices,
        selectedAssociatedServiceId,
        odsCode,
      });

      logger.info(`navigating to order ${orderId} associated-services select associated-service page`);
      return res.render('pages/sections/order-items/associated-services/select/associated-service/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }),
  );

  router.post('/associated-service', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const response = validateAssociatedServicesForm({ data: req.body });

    if (response.success) {
      const selectedItemId = req.body.selectAssociatedService;
      const selectedItem = findSelectedCatalogueItemInSession({
        req,
        selectedItemId,
        sessionManager,
        catalogueItemsKey: 'associatedServices',
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
          `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/${existingItem[0].catalogueItemId}`,
        );
      }

      logger.info('redirecting to associated services select price page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/select/associated-service/price`);
    }

    const associatedServices = sessionManager.getFromSession({
      req, key: sessionKeys.associatedServices,
    });
    const context = await getAssociatedServiceErrorPageContext({
      orderId,
      associatedServices,
      validationErrors: response.errors,
    });

    return res.render(
      'pages/sections/order-items/associated-services/select/associated-service/template.njk',
      addContext({ context, user: req.user, csrfToken: req.csrfToken() }),
    );
  }));

  router.get('/associated-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedPriceId = Number(sessionManager.getFromSession({
      req, key: sessionKeys.selectedPriceId,
    }));
    const catalogueItemId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const selectedAssociatedServiceName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });

    const associatedServicePrices = await getCatalogueItemPricing({
      catalogueItemId,
      accessToken,
      loggerText: 'Associated service',
    });

    sessionManager.saveToSession({
      req, key: sessionKeys.associatedServicePrices, value: associatedServicePrices,
    });

    if (((associatedServicePrices || {}).prices || {}).length === 1) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: associatedServicePrices.prices[0].priceId,
      });

      logger.info('redirecting to additional services select recipients page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/neworderitem`);
    }

    const context = getAssociatedServicePricePageContext({
      orderId,
      associatedServicePrices,
      selectedPriceId,
      selectedAssociatedServiceName,
      odsCode,
    });

    logger.info(`navigating to order ${orderId} associated-services select price page`);
    return res.render('pages/sections/order-items/associated-services/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/associated-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const response = validateAssociatedServicePriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: req.body.selectAssociatedServicePrice,
      });
      logger.info('Redirect to new associated service order item page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/neworderitem`);
    }

    const selectedAssociatedServiceName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const associatedServicePrices = sessionManager.getFromSession({
      req, key: sessionKeys.associatedServicePrices,
    });
    const context = await getAssociatedServicePriceErrorPageContext({
      orderId,
      associatedServicePrices,
      selectedAssociatedServiceName,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/associated-services/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
