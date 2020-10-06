import { getServiceRecipients as getServiceRecipientsFromApi } from '../api/oapi/getServiceRecipients';
import { sessionKeys, getFromSessionOrApi } from './sessionHelper';

export const getServiceRecipients = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const apiCall = async () => {
    const orgId = req.user.primaryOrganisationId;
    return getServiceRecipientsFromApi({
      orgId,
      accessToken,
      logger,
    });
  };

  const sessionData = { req, key: sessionKeys.recipients };
  return getFromSessionOrApi({ sessionData, sessionManager, apiCall });
};
