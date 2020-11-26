import { getCommencementDate as getCommencementDateFromApi } from '../api/ordapi/getCommencementDate';
import { sessionKeys, getFromSessionOrApi } from './sessionHelper';

export const getCommencementDate = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const apiCall = async () => {
    const orgId = req.user.primaryOrganisationId;
    const { commencementDate } = await getCommencementDateFromApi({
      orgId,
      accessToken,
      logger,
    });
    return commencementDate;
  };

  const sessionData = { req, key: sessionKeys.plannedDeliveryDate };
  return getFromSessionOrApi({ sessionData, sessionManager, apiCall });
};
