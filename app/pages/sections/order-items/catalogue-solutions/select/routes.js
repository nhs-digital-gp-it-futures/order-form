import express from 'express';
import { logger } from '../../../../../logger';
import config from '../../../../../config';
import { withCatch, extractAccessToken } from '../../../../../helpers/routes/routerHelper';
import { getRecipients } from '../../../../../helpers/api/ordapi/getRecipients';
import {
  findSolutions,
  getSupplierId,
  getSolutionsErrorPageContext,
  getSolutionsPageContext,
  validateSolutionForm,
} from './solution/controller';
import {
  findSolutionPrices,
  getSolutionPriceErrorPageContext,
  getSolutionPricePageContext,
  validateSolutionPriceForm,
} from './price/controller';
import {
  getRecipientPageContext,
  getSolution,
  validateRecipientForm,
  getRecipientErrorPageContext,
  getServiceRecipientName,
} from './recipient/controller';

const router = express.Router({ mergeParams: true });

export const catalogueSolutionsSelectRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`);
  }));

  router.get('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const supplierId = await getSupplierId({ orderId, accessToken });
    const solutions = await findSolutions({ supplierId, accessToken });
    sessionManager.saveToSession({ req, key: 'solutions', value: solutions });

    const context = await getSolutionsPageContext({ orderId, solutions, selectedSolutionId });

    logger.info(`navigating to order ${orderId} catalogue-solutions select solution page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionForm({ data: req.body });

    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedItemId', value: req.body.selectSolution });
      logger.info('redirecting catalogue solutions select price page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price`);
    }

    const solutions = sessionManager.getFromSession({ req, key: 'solutions' });
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
    const selectedPriceId = Number(sessionManager.getFromSession({ req, key: 'selectedPriceId' }));
    const solutionId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const solutionPrices = await findSolutionPrices({ solutionId, accessToken });
    sessionManager.saveToSession({ req, key: 'solutionPrices', value: solutionPrices });

    const context = getSolutionPricePageContext({ orderId, solutionPrices, selectedPriceId });

    logger.info(`navigating to order ${orderId} catalogue-solutions select price page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionPriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedPriceId', value: req.body.selectSolutionPrice });
      logger.info('redirecting catalogue solutions select recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipient`);
    }

    const solutionPrices = sessionManager.getFromSession({ req, key: 'solutionPrices' });
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

    const solutionId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const solutionData = await getSolution({ solutionId });

    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: 'recipients', value: recipients });

    const selectedRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });

    const context = await getRecipientPageContext({
      orderId,
      solutionName: solutionData.name,
      recipients,
      selectedRecipientId,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions select recipient page`);
    return res.render('pages/sections/order-items/catalogue-solutions/select/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;
    const recipients = sessionManager.getFromSession({ req, key: 'recipients' });

    const response = validateRecipientForm({ data: req.body });
    if (response.success) {
      const selectedRecipientId = req.body.selectRecipient;
      const selectedRecipientName = getServiceRecipientName(
        { serviceRecipientId: selectedRecipientId, recipients },
      );

      sessionManager.saveToSession({ req, key: 'selectedRecipientId', value: selectedRecipientId });
      sessionManager.saveToSession({ req, key: 'selectedRecipientName', value: selectedRecipientName });
      logger.info('Redirect to new solution page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/neworderitem`);
    }

    const solutionId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const solutionData = await getSolution({ solutionId });

    const context = await getRecipientErrorPageContext({
      orderId,
      solutionName: solutionData.name,
      recipients,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/order-items/catalogue-solutions/select/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
