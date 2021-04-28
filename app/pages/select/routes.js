import express from 'express';
import config from '../../config';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getSelectContext } from './controller';
import { sessionKeys } from '../../helpers/routes/sessionHelper';

export const selectOrganisationRoutes = (authProvider, addContext, sessionManager) => {
  const router = express.Router({ mergeParams: true });

  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const context = await getSelectContext({
      accessToken,
      orgId: req.user.primaryOrganisationId,
      orgName: req.user.primaryOrganisationName,
    });
    logger.info('navigating to organisation selection page');
    res.render('pages/select/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/',
    authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
      const selectedOrganisation = req.body.organisation;
      const split = selectedOrganisation.split('|');

      sessionManager.saveToSession({
        req, key: sessionKeys.proxyOrganisationId, value: split[0],
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.proxyOrganisationName, value: split[1],
      });

      logger.info('proxy organisation Id updated');
      return res.redirect(`${config.baseUrl}/organisation/`);
    }));

  return router;
};
