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
} from './select-solution/controller';
import {
  findSolutionPrices,
  getSolutionPriceErrorPageContext,
  getSolutionPricePageContext,
  validateSolutionSelectPriceForm,
} from './select-price/controller';

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

  router.get('/select-solution', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const supplierId = await getSupplierId({ orderId, accessToken });
    const solutions = await findSolutions({ supplierId, accessToken });
    sessionManager.saveToSession({ req, key: 'solutionsFound', value: solutions });

    const context = await getSolutionsSelectPageContext({ orderId, solutions });

    logger.info(`navigating to order ${orderId} catalogue-solutions select solution page`);
    return res.render('pages/sections/catalogue-solutions/select-solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/select-solution', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionSelectForm({ data: req.body });

    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedSolution', value: req.body.selectSolution });
      logger.info('redirecting catalogue solutions select-price page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select-solution/select-price`);
    }

    const solutionsFound = sessionManager.getFromSession({ req, key: 'solutionsFound' });
    const context = await getSolutionsSelectErrorPageContext({
      orderId,
      solutions: solutionsFound,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/catalogue-solutions/select-solution/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/select-solution/select-price', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const solutionId = sessionManager.getFromSession({ req, key: 'selectedSolution' });
    const solutionPrices = await findSolutionPrices({ solutionId, accessToken });
    sessionManager.saveToSession({ req, key: 'solutionPricesFound', value: solutionPrices });

    const context = await getSolutionPricePageContext({ orderId, solutionPrices });

    logger.info(`navigating to order ${orderId} catalogue-solutions select price page`);
    return res.render('pages/sections/catalogue-solutions/select-price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/select-solution/select-price', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSolutionSelectPriceForm({ data: req.body });
    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedSolutionPrice', value: req.body.selectSolutionPrice });
      logger.info('redirecting catalogue solutions select-price-recipient page');
      return res.redirect(`${config.baseUrl}/organisation/${orderId}/catalogue-solutions/select-solution/select-price/select-recipient`);
    }

    const solutionPrices = sessionManager.getFromSession({ req, key: 'solutionPricesFound' });
    const context = await getSolutionPriceErrorPageContext({
      orderId,
      solutionPrices,
      validationErrors: response.errors,
    });


    return res.render('pages/sections/catalogue-solutions/select-price/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  return router;
};
