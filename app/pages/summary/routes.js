import express from 'express';
import { getOrder } from '../../helpers/api/ordapi/getOrder';
import { getSummaryPageContext } from './controller';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';

const router = express.Router({ mergeParams: true });

export const summaryRoutes = (authProvider, addContext) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId } = req.params;
    const { print } = req.query;

    const {
      orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
    } = await getOrder({ orderId, accessToken });

    const context = await getSummaryPageContext({
      orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
    });

    if (print) {
      return res.render('pages/summary/templatePrint.njk', addContext({ context, user: req.user }));
    }

    return res.render('pages/summary/template.njk', addContext({ context, user: req.user }));
  }));

  return router;
};
