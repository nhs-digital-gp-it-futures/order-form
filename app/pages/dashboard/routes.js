import express from 'express';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getDashboardContext } from './controller';
import { getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';

const router = express.Router({ mergeParams: true });

export const dashboardRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const { odsCode } = req.params;
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { organisationId, name } = await getOrganisationFromOdsCode({
      req, sessionManager, odsCode, accessToken,
    });
    const context = await getDashboardContext({
      accessToken,
      orgId: organisationId,
      orgName: name,
      relatedOrganisationIds: req.user.relatedOrganisationId,
      odsCode,
    });
    logger.info('navigating to organisation orders page');
    res.render('pages/dashboard/template.njk', addContext({ context, user: req.user }));
  }));

  return router;
};
