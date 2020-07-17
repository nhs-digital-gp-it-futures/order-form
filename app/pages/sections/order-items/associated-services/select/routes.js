import express from 'express';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getAssociatedServicePageContext } from './associated-service/controller';
import {
  getAssociatedServicePricePageContext,
  getAssociatedServicePriceErrorPageContext,
  validateAssociatedServicePriceForm,
} from './price/controller';

const router = express.Router({ mergeParams: true });

export const associatedServicesSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/associated-services/select/associated-service`);
  }));

  router.get(
    '/associated-service',
    authProvider.authorise({ claim: 'ordering' }),
    withCatch(logger, authProvider, async (req, res) => {
      const { orderId } = req.params;

      const context = getAssociatedServicePageContext({
        orderId,
        accessToken: extractAccessToken({ req, tokenType: 'access' }),
      });

      logger.info(`navigating to order ${orderId} associated-services select associated-service page`);
      return res.render('pages/sections/order-items/associated-services/select/associated-service/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }),
  );

  router.get('/associated-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedPriceId = Number(sessionManager.getFromSession({ req, key: 'selectedPriceId' }));
    const catalogueItemId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const selectedAssociatedServiceName = sessionManager.getFromSession({ req, key: 'selectedItemName' });

    const associatedServicePrices = await getCatalogueItemPricing({
      catalogueItemId,
      accessToken,
      loggerText: 'Associated service',
    });

    sessionManager.saveToSession({ req, key: 'associatedServicePrices', value: associatedServicePrices });

    const context = getAssociatedServicePricePageContext({
      orderId,
      associatedServicePrices,
      selectedPriceId,
      selectedAssociatedServiceName,
    });

    logger.info(`navigating to order ${orderId} associated-services select price page`);
    return res.render('pages/sections/order-items/associated-services/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/associated-service/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateAssociatedServicePriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedPriceId', value: req.body.selectAssociatedServicePrice });
      logger.info('redirecting to associated services select recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/associated-services/select/associated-service/price/recipient`);
    }

    const selectedAssociatedServiceName = sessionManager.getFromSession({ req, key: 'selectedItemName' });
    const associatedServicePrices = sessionManager.getFromSession({ req, key: 'associatedServicePrices' });
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
