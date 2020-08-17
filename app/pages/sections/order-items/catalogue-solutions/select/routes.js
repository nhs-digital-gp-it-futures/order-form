import express from 'express';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getRecipients } from '../../../../../helpers/api/ordapi/getRecipients';
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
  getRecipientPageContext,
  validateRecipientForm,
  getRecipientErrorPageContext,
  getServiceRecipientName,
} from './recipient/controller';
import {
  findSelectedCatalogueItemInSession,
} from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import {
  getCatalogueItems,
} from '../../../../../helpers/api/bapi/getCatalogueItems';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getSupplier } from '../../../../../helpers/api/ordapi/getSupplier';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

const router = express.Router({ mergeParams: true });

export const catalogueSolutionsSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`);
  }));

  router.get('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedSolutionId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const supplierData = await getSupplier({ orderId, accessToken });
    const solutions = await getCatalogueItems({ supplierId: supplierData.supplierId, catalogueItemType: 'Solution' });
    sessionManager.saveToSession({ req, key: sessionKeys.solutions, value: solutions });

    const context = await getSolutionsPageContext({ orderId, solutions, selectedSolutionId });

    logger.info(`navigating to order ${orderId} catalogue-solutions select solution page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionForm({ data: req.body });

    if (response.success) {
      const selectedItemId = req.body.selectSolution;
      const selectedItem = findSelectedCatalogueItemInSession({
        req,
        selectedItemId,
        sessionManager,
        catalogueItemsKey: 'solutions',
      });

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedItemId, value: selectedItemId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedItemName, value: selectedItem.name,
      });
      logger.info('redirecting catalogue solutions select price page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price`);
    }

    const solutions = sessionManager.getFromSession({ req, key: sessionKeys.solutions });
    const context = await getSolutionsErrorPageContext({
      orderId,
      solutions,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/select/solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
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

    const context = getSolutionPricePageContext({
      orderId,
      solutionPrices,
      selectedPriceId,
      selectedCatalogueItemName,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions select price page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionPriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedPriceId, value: req.body.selectSolutionPrice,
      });
      logger.info('redirecting catalogue solutions select recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipient`);
    }

    const solutionPrices = sessionManager.getFromSession({
      req, key: sessionKeys.solutionPrices,
    });
    const context = await getSolutionPriceErrorPageContext({
      orderId,
      solutionPrices,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const solutionName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });

    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: sessionKeys.recipients, value: recipients });

    const selectedRecipientId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipientId,
    });

    const context = await getRecipientPageContext({
      orderId,
      solutionName,
      recipients,
      selectedRecipientId,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions select recipient page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const recipients = sessionManager.getFromSession({
      req, key: sessionKeys.recipients,
    });

    const response = validateRecipientForm({ data: req.body });
    if (response.success) {
      const selectedRecipientId = req.body.selectRecipient;
      const selectedRecipientName = getServiceRecipientName(
        { serviceRecipientId: selectedRecipientId, recipients },
      );

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipientId, value: selectedRecipientId,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedRecipientName, value: selectedRecipientName,
      });
      logger.info('Redirect to new solution page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/neworderitem`);
    }

    const solutionName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });

    const context = await getRecipientErrorPageContext({
      orderId,
      solutionName,
      recipients,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/select/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
