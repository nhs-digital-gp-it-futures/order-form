import express from 'express';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { clearSession } from '../../helpers/routes/sessionHelper';
import { getTaskListPageContext } from './controller';

const router = express.Router({ mergeParams: true });

export const tasklistRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { orderId, odsCode } = req.params;

    clearSession({ req, sessionManager });

    const context = await getTaskListPageContext({ accessToken, orderId, odsCode });
    logger.info(`navigating to order ${orderId} task list page`);
    res.render('pages/task-list/template.njk', addContext({ context, user: req.user }));
  }));

  return router;
};
