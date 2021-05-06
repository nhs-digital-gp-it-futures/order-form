import express from 'express';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getDashboardContext } from './controller';

const router = express.Router({ mergeParams: true });

export const dashboardRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const context = await getDashboardContext({
      req,
      sessionManager,
      accessToken,
      orgId: req.user.primaryOrganisationId,
      orgName: req.user.primaryOrganisationName,
      relatedOrganisationIds: req.user.relatedOrganisationId,
    });
    logger.info('navigating to organisation orders page');
    res.render('pages/dashboard/template.njk', addContext({ context, user: req.user }));
  }));

  return router;
};
