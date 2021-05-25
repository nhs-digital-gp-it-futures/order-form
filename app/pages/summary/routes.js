import express from 'express';
import { getOrder } from '../../helpers/api/ordapi/getOrder';
import { getSummaryPageContext } from './controller';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';

const router = express.Router({ mergeParams: true });

export const summaryRoutes = (authProvider, addContext) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId, odsCode } = req.params;
    const { print } = req.query;

    const {
      orderData, oneOffCostItems, recurringCostItems,
    } = await getOrder({ orderId, accessToken });

    const context = await getSummaryPageContext({
      orderId, orderData, oneOffCostItems, recurringCostItems, odsCode,
    });

    if (print) {
      res.set('Content-Security-Policy', 'default-src * \'unsafe-inline\' \'unsafe-eval\'; script-src * \'unsafe-inline\' \'unsafe-eval\';');
      return res.render('pages/summary/templatePrint.njk', addContext({ context, req }));
    }

    return res.render('pages/summary/template.njk', addContext({ context, req }));
  }));

  return router;
};
