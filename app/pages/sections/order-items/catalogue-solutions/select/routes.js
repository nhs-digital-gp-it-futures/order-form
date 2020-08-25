import express from 'express';
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
import { getServiceRecipientsContext } from './recipients/controller';
import {
  findSelectedCatalogueItemInSession,
} from '../../../../../helpers/routes/findSelectedCatalogueItemInSession';
import {
  getCatalogueItems,
} from '../../../../../helpers/api/bapi/getCatalogueItems';
import { getCatalogueItemPricing } from '../../../../../helpers/api/bapi/getCatalogueItemPricing';
import { getSupplier } from '../../../../../helpers/api/ordapi/getSupplier';
import { getServiceRecipients as getRecipientsFromOapi } from '../../../../../helpers/api/oapi/getServiceRecipients';
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
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients`);
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

  router.get('/solution/price/recipients', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const { selectStatus } = req.query;

    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });

    const orgId = req.user.primaryOrganisationId;

    const serviceRecipients = await getRecipientsFromOapi({ orgId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    sessionManager.saveToSession({
      req, key: sessionKeys.recipients, value: serviceRecipients,
    });

    const context = await getServiceRecipientsContext({
      orderId, itemName, selectStatus, serviceRecipients,
    });
    logger.info(`navigating to order ${orderId} catalogue-solutions select recipient page`);
    res.render('pages/sections/order-items/catalogue-solutions/select/recipients/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
