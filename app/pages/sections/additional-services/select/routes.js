import express from 'express';
import { logger } from '../../../../logger';
import config from '../../../../config';
import { withCatch, extractAccessToken } from '../../../../helpers/routerHelper';
import {
  findAdditionalServices,
  findAddedCatalogueSolutions,
  getAdditionalServicePageContext,
  getAdditionalServiceErrorPageContext,
  validateAdditionalServicesForm,
} from './additional-service/controller';

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
      const additionalServiceId = sessionManager.getFromSession({ req, key: 'selectedAdditionalServiceId' });
      sessionManager.saveToSession({ req, key: 'additionalServices', value: additionalServices });

      const context = getAdditionalServicePageContext({
        orderId,
        additionalServices,
        additionalServiceId,
      });

      logger.info(`navigating to order ${orderId} additional-services select additional-service page`);
      return res.render('pages/sections/additional-services/select/additional-service/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }),
  );

  router.post('/additional-service', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateAdditionalServicesForm({ data: req.body });

    if (response.success) {
      sessionManager.saveToSession({ req, key: 'selectedAdditionalServiceId', value: req.body.selectAdditionalService });

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
      'pages/sections/additional-services/select/additional-service/template.njk',
      addContext({ context, user: req.user, csrfToken: req.csrfToken() }),
    );
  }));

  return router;
};
