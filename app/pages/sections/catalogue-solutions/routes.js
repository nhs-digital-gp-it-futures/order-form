import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import {
  findSolutions,
  getSupplierId,
  getSolutionsSelectErrorPageContext,
  getSolutionsSelectPageContext,
  validateSolutionSelectForm,
} from './solution/controller';
import {
  findSolutionPrices,
  getSolutionPriceErrorPageContext,
  getSolutionPricePageContext,
  validateSolutionSelectPriceForm,
} from './price/controller';
import {
  getSolutionRecipientPageContext,
  getRecipients,
  getSolution,
  validateRecipientSelectForm,
  getRecipientSelectErrorPageContext,
} from './recipient/controller';

const router = express.Router({ mergeParams: true });

export const catalogueSolutionsRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const context = await getCatalogueSolutionsPageContext({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions page`);
    return res.render('pages/sections/catalogue-solutions/catalogue-solutions/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    await putCatalogueSolutions({
      orderId,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });

    return res.redirect(`${config.baseUrl}/organisation/${orderId}`);
  }));

  router.get('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const supplierId = await getSupplierId({ orderId, accessToken });
    const solutions = await findSolutions({ supplierId, accessToken });
    sessionManager.saveToSession({ req, key: 'solutions', value: solutions });

    const context = await getSolutionsSelectPageContext({ orderId, solutions });

    logger.info(`navigating to order ${orderId} catalogue-solutions select solution page`);
    return res.render('pages/sections/catalogue-solutions/solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionSelectForm({ data: req.body });

    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedSolutionId', value: req.body.selectSolution });
      logger.info('redirecting catalogue solutions select price page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/solution/price`);
    }

    const solutions = sessionManager.getFromSession({ req, key: 'solutions' });
    const context = await getSolutionsSelectErrorPageContext({
      orderId,
      solutions,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const solutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const solutionPrices = await findSolutionPrices({ solutionId, accessToken });
    sessionManager.saveToSession({ req, key: 'solutionPrices', value: solutionPrices });

    const context = await getSolutionPricePageContext({ orderId, solutionPrices });

    logger.info(`navigating to order ${orderId} catalogue-solutions select price page`);
    return res.render('pages/sections/catalogue-solutions/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionSelectPriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedPriceId', value: req.body.selectSolutionPrice });
      logger.info('redirecting catalogue solutions select recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/solution/price/recipient`);
    }

    const solutionPrices = sessionManager.getFromSession({ req, key: 'solutionPrices' });
    const context = await getSolutionPriceErrorPageContext({
      orderId,
      solutionPrices,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/solution/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });

    const solutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const solutionData = await getSolution({ solutionId });

    const recipients = await getRecipients({ orderId, accessToken });
    sessionManager.saveToSession({ req, key: 'recipients', value: recipients });

    const context = await getSolutionRecipientPageContext({
      orderId,
      solutionName: solutionData.name,
      recipients,
    });

    logger.info(`navigating to order ${orderId} catalogue-solutions select recipient page`);
    return res.render('pages/sections/catalogue-solutions/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/solution/price/recipient', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateRecipientSelectForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedRecipientId', value: req.body.selectRecipient });
      logger.info('Redirect to new solution page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/newsolution`);
    }

    const solutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const solutionData = await getSolution({ solutionId });

    const recipients = sessionManager.getFromSession({ req, key: 'recipients' });
    const context = await getRecipientSelectErrorPageContext({
      orderId,
      solutionName: solutionData.name,
      recipients,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/recipient/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
