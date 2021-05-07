import express from 'express';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routes/routerHelper';
import {
  getSupplierSearchPageContext,
  validateSupplierSearchForm,
  getSupplierSearchPageErrorContext,
} from './search/controller';
import {
  getSupplierSelectPageContext,
  validateSupplierSelectForm,
  getSupplierSelectErrorPageContext,
} from './select/controller';
import {
  getSupplierPageContext,
  getSupplierPageErrorContext,
} from './supplier/controller';
import { getSearchSuppliers } from '../../../helpers/api/bapi/getSearchSuppliers';
import { checkOrdapiForSupplier } from './controller';
import { sessionKeys } from '../../../helpers/routes/sessionHelper';
import { putSupplier } from '../../../helpers/api/ordapi/putSupplier';

const router = express.Router({ mergeParams: true });

export const supplierRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const dataFoundInOrdapi = await checkOrdapiForSupplier({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    try {
      const selectedSupplier = sessionManager.getFromSession({
        req, key: sessionKeys.selectedSupplier,
      });
      const context = await getSupplierPageContext({
        orderId,
        supplierId: selectedSupplier,
        accessToken: extractAccessToken({ req, tokenType: 'access' }),
        hasSavedData: dataFoundInOrdapi,
      });
      return res.render('pages/sections/supplier/supplier/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    } catch (err) {
      logger.info('redirecting to suppliers search page');
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier/search`);
    }
  }));

  router.post('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const response = await putSupplier({
      orderId,
      data: req.body,
      accessToken: extractAccessToken({ req, tokenType: 'access' }),
    });
    if (response.success) return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}`);

    const dataFoundInOrdapi = await checkOrdapiForSupplier({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });

    const context = await getSupplierPageErrorContext({
      validationErrors: response.errors,
      orderId,
      data: req.body,
      hasSavedData: dataFoundInOrdapi,
    });
    return res.render('pages/sections/supplier/supplier/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/search', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const dataFoundInOrdapi = await checkOrdapiForSupplier({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
    if (dataFoundInOrdapi) return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier`);

    const context = await getSupplierSearchPageContext({ orderId });
    logger.info(`navigating to order ${orderId} suppliers search page`);
    return res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/search', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;

    const response = validateSupplierSearchForm({ data: req.body });

    if (response.success) {
      const accessToken = extractAccessToken({ req, tokenType: 'access' });

      const suppliersFound = await getSearchSuppliers({
        name: req.body.supplierName, accessToken,
      });

      if (suppliersFound.length > 0) {
        sessionManager.saveToSession({
          req, key: sessionKeys.suppliersFound, value: suppliersFound,
        });
        logger.info('redirecting suppliers select page');
        return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier/search/select`);
      }

      throw new ErrorContext({
        status: 404,
        title: 'No supplier found',
        description: "There are no suppliers that match the search terms you've provided. Try searching again.",
        backLinkText: 'Go back to search',
        backLinkHref: `${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier/search`,
      });
    }

    const context = await getSupplierSearchPageErrorContext({
      orderId,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/search/select', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const dataFoundInOrdapi = await checkOrdapiForSupplier({ orderId, accessToken: extractAccessToken({ req, tokenType: 'access' }) });

    if (dataFoundInOrdapi) return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier`);

    const suppliersFound = sessionManager.getFromSession({
      req, key: sessionKeys.suppliersFound,
    });
    if (suppliersFound) {
      const selectedSupplier = sessionManager.getFromSession({
        req, key: sessionKeys.selectedSupplier,
      });
      const context = getSupplierSelectPageContext({
        orderId, suppliers: suppliersFound, selectedSupplier,
      });

      logger.info(`navigating to order ${orderId} suppliers select page`);
      return res.render('pages/sections/supplier/select/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }

    logger.info('no suppliers found in session redirecting suppliers search page');
    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier/search`);
  }));

  router.post('/search/select', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId, odsCode } = req.params;
    const suppliersFound = sessionManager.getFromSession({ req, key: sessionKeys.suppliersFound });

    if (suppliersFound) {
      const response = validateSupplierSelectForm({ data: req.body });

      if (response.success) {
        sessionManager.saveToSession({
          req, key: sessionKeys.selectedSupplier, value: req.body.selectSupplier,
        });
        logger.info('redirecting supplier section page');
        return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier`);
      }

      const context = await getSupplierSelectErrorPageContext({
        orderId,
        suppliers: suppliersFound,
        validationErrors: response.errors,
      });

      return res.render('pages/sections/supplier/select/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }
    logger.info('no suppliers found in session redirecting suppliers search page');
    return res.redirect(`${config.baseUrl}/organisation/${odsCode}/${orderId}/supplier/search`);
  }));

  return router;
};
