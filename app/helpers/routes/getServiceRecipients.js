import { getServiceRecipients as getServiceRecipientsFromApi } from '../api/oapi/getServiceRecipients';
import { sessionKeys, getFromSessionOrApi } from './sessionHelper';
import { getOrganisationFromOdsCode } from '../controllers/odsCodeLookup';

export const getServiceRecipients = async ({
  req,
  sessionManager,
  accessToken,
  logger,
  odsCode,
}) => {
  const apiCall = async () => {
    const { organisationId } = await getOrganisationFromOdsCode({
      req, sessionManager, odsCode, accessToken,
    });
    return getServiceRecipientsFromApi({
      orgId: organisationId,
      accessToken,
      logger,
    });
  };

  const sessionData = { req, key: sessionKeys.recipients };
  return getFromSessionOrApi({ sessionData, sessionManager, apiCall });
};
