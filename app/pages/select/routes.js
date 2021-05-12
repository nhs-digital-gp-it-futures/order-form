import express from 'express';
import config from '../../config';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getSelectContext } from './controller';
import { sessionKeys } from '../../helpers/routes/sessionHelper';

import { getOdsCodeForOrganisation } from '../../helpers/controllers/odsCodeLookup';

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
      const accessToken = extractAccessToken({ req, tokenType: 'access' });
      const orgId = req.body.organisation;

      const odsCode = await getOdsCodeForOrganisation({
        req, sessionManager, orgId, accessToken,
      });

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedOdsCode, value: odsCode,
      });

      return res.redirect(`${config.baseUrl}/organisation/`);
    }));

  return router;
};
