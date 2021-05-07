import express from 'express';
import { logger } from '../../logger';
import config from '../../config';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getSelectContext } from './controller';

export const selectOrganisationRoutes = (authProvider, addContext) => {
  const router = express.Router({ mergeParams: true });

  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { odsCode } = req.params;
    const context = await getSelectContext({
      accessToken,
      orgId: req.user.primaryOrganisationId,
      orgName: req.user.primaryOrganisationName,
      odsCode,
    });

    context.backLinkHref = `${config.baseUrl}/organisation/${odsCode}`;
    logger.info('navigating to organisation selection page');
    res.render('pages/select/template.njk', addContext({ context, user: req.user }));
  }));

  return router;
};
