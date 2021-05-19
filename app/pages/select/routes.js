import express from 'express';
import config from '../../config';
import { logger } from '../../logger';
import { withCatch, extractAccessToken } from '../../helpers/routes/routerHelper';
import { getSelectContext, getSelectErrorContext } from './controller';
import { sessionKeys } from '../../helpers/routes/sessionHelper';

import { getOdsCodeForOrganisation, getOrganisationFromOdsCode } from '../../helpers/controllers/odsCodeLookup';

export const selectOrganisationRoutes = (authProvider, addContext, sessionManager) => {
  const router = express.Router({ mergeParams: true });

  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
    const accessToken = extractAccessToken({ req, tokenType: 'access' });
    const { odsCode } = req.params;
    const { organisationId, name } = await getOrganisationFromOdsCode({
      req, sessionManager, odsCode, accessToken,
    });
    const selectedOrgId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedOrgId,
    });

    const context = await getSelectContext({
      accessToken,
      orgId: organisationId,
      orgName: name,
      odsCode,
      selectedOrgId,
    });

    logger.info('navigating to organisation selection page');
    res.render('pages/select/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
  }));

  router.post('/',
    authProvider.authorise({ claim: 'ordering' }), withCatch(logger, authProvider, async (req, res) => {
      const accessToken = extractAccessToken({ req, tokenType: 'access' });
      const orgId = req.body.organisation;

      if (!orgId) {
        const context = await getSelectErrorContext({ accessToken, req });

        logger.info('redirecting back to organisation selection page due to validation error');
        return res.render('pages/select/template.njk', addContext({ context, req, csrfToken: req.csrfToken() }));
      }

      const odsCode = await getOdsCodeForOrganisation({
        req, sessionManager, orgId, accessToken,
      });

      sessionManager.saveToSession({
        req, key: sessionKeys.selectedOdsCode, value: odsCode,
      });
      sessionManager.saveToSession({
        req, key: sessionKeys.selectedOrgId, value: orgId,
      });

      return res.redirect(`${config.baseUrl}/organisation/${odsCode}`);
    }));

  return router;
};
