import express from 'express';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './catalogue-solutions/controller';
import {
  getSolutionsSelectPageContext,
  findSolutions,
  getSupplierId,
  validateSolutionSelectForm,
  getSolutionsSelectErrorPageContext,
} from './select-solution/controller';

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
      sessionManager.saveToSession({ req, key: 'selectedSupplier', value: req.body.selectSupplier });
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

    logger.info(`navigating to order ${orderId} catalogue-solutions select price solution page`);
    return res.send('select solution page');
  }));

  return router;
};
