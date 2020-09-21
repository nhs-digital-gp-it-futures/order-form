import express from 'express';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
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
  getAdditionalServiceRecipientPageContext,
  getAdditionalServiceRecipientErrorPageContext,
  validateAdditionalServiceRecipientForm,
  getAdditionalServiceRecipientName,
} from './recipient/controller';
import {
  findSelectedCatalogueItemInSession,
} from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getAdditionalServices } from '../../../../../helpers/api/bapi/getAdditionalServices';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

const router = express.Router({ mergeParams: true });

export const additionalServicesSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service`);
  }));

  router.get(
    '/additional-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => {
      const { orderId } = req.params;
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
          backLinkHref: `${config.baseUrl}/organisation/${orderId}/additional-services`,
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
      });

      logger.info(`navigating to order ${orderId} additional-services select additional-service page`);
      return res.render('pages/sections/order-items/additional-services/select/additional-service/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }),
  );

  router.post('/additional-service', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateAdditionalServicesForm({ data: req.body });

    if (response.success) {
      const selectedItemId = req.body.selectAdditionalService;
      const selectedItem = findSelectedCatalogueItemInSession({
        req,
        selectedItemId,
        sessionManager,
        catalogueItemsKey: 'additionalServices',
      });

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedItemId, value: selectedItemId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedItemName, value: selectedItem.name,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedCatalogueSolutionId, value: selectedItem.solution.solutionId,
      });

      logger.info('redirecting additional services select price page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`);
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
      addContext({ context, user: req.user, csrfToken: req.csrfToken() }),
    );
  }));

  router.get('/additional-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
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

    const context = getAdditionalServicePricePageContext({
      orderId,
      additionalServicePrices,
      selectedPriceId,
      selectedAdditionalServiceName,
    });

    logger.info(`navigating to order ${orderId} additional-services select price page`);
    return res.render('pages/sections/order-items/additional-services/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateAdditionalServicePriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: req.body.selectAdditionalServicePrice,
      });
      logger.info('redirecting to additional services select recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipient`);
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

    return res.render('pages/sections/order-items/additional-services/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/additional-service/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });
    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: sessionKeys.recipients, value: recipients });

    const selectedAdditionalRecipientId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipientId,
    });

    const context = await getAdditionalServiceRecipientPageContext({
      orderId,
      itemName,
      recipients,
      selectedAdditionalRecipientId,
    });

    logger.info(`navigating to order ${orderId} additional-services select recipient page`);
    return res.render('pages/sections/order-items/additional-services/select/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/additional-service/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
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
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/neworderitem`);
    }

    const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });

    const context = await getAdditionalServiceRecipientErrorPageContext({
      orderId,
      itemName,
      recipients,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/additional-services/select/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));
  return router;
};
