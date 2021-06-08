import express from 'express';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { clearSession } from '../../helpers/routes/sessionHelper';
import { getTaskListPageContext } from './controller';
import config from '../../config';

const router = express.Router({ mergeParams: true });

export const tasklistRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId, odsCode } = req.params;

    clearSession({ req, sessionManager });

    const context = await getTaskListPageContext({
      req, accessToken, orderId, odsCode, sessionManager,
    });
    if (!context) {
      return res.redirect(`${config.baseUrl}/organisation/${odsCode}`);
    }
    logger.info(`navigating to order ${orderId} task list page`);
    return res.render('pages/task-list/template.njk', addContext({ context, req }));
  }));

  return router;
};
