import express from 'express';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getRecipients } from '../../../../../helpers/api/ordapi/getRecipients';
import {
  findAdditionalServices,
  findAddedCatalogueSolutions,
  findSelectedCatalogueItemInSession,
  getAdditionalServicePageContext,
  getAdditionalServiceErrorPageContext,
  validateAdditionalServicesForm,
} from './additional-service/controller';
import {
  findAdditionalServicePrices,
  getAdditionalServicePricePageContext,
} from './price/controller';
import {
  getAdditionalServiceRecipientPageContext,
  getAdditionalServiceRecipientErrorPageContext,
  validateAdditionalServiceRecipientForm,
  getAdditionalServiceRecipientName,
} from './recipient/controller';

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
      const additionalServices = await findAdditionalServices({
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

      const selectedAdditionalServiceId = sessionManager.getFromSession({ req, key: 'selectedAdditionalServiceId' });
      sessionManager.saveToSession({ req, key: 'additionalServices', value: additionalServices });

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
      });

      sessionManager.saveToSession({ req, key: 'selectedItemId', value: selectedItemId });
      sessionManager.saveToSession({ req, key: 'selectedItemName', value: selectedItem.name });

      logger.info('redirecting additional services select price page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`);
    }

    const additionalServices = sessionManager.getFromSession({ req, key: 'additionalServices' });
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
    const selectedPriceId = Number(sessionManager.getFromSession({ req, key: 'selectedPriceId' }));
    const catalogueItemId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const selectedAdditionalServiceName = sessionManager.getFromSession({ req, key: 'selectedItemName' });

    const additionalServicePrices = await findAdditionalServicePrices({
      catalogueItemId,
      accessToken,
    });
    sessionManager.saveToSession({ req, key: 'additionalServicePrices', value: additionalServicePrices });

    const context = getAdditionalServicePricePageContext({
      orderId,
      additionalServicePrices,
      selectedPriceId,
      selectedAdditionalServiceName,
    });

    logger.info(`navigating to order ${orderId} additional-services select price page`);
    return res.render('pages/sections/order-items/additional-services/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/additional-service/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const itemName = sessionManager.getFromSession({ req, key: 'selectedItemName' });
    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: 'recipients', value: recipients });

    const selectedAdditionalRecipientId = sessionManager.getFromSession({ req, key: 'selectedAdditionalRecipientId' });

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
    const recipients = sessionManager.getFromSession({ req, key: 'recipients' });

    const response = validateAdditionalServiceRecipientForm({ data: req.body });
    if (response.success) {
      const selectedRecipientId = req.body.selectRecipient;
      const selectedRecipientName = getAdditionalServiceRecipientName(
        { serviceRecipientId: selectedRecipientId, recipients },
      );
      sessionManager.saveToSession({ req, key: 'selectedAdditionalRecipientId', value: selectedRecipientId });
      sessionManager.saveToSession({ req, key: 'selectedRecipientName', value: selectedRecipientName });
      logger.info('Redirect to new additional service order item page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/additional-services/neworderitem`);
    }

    const itemName = sessionManager.getFromSession({ req, key: 'selectedItemName' });

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
