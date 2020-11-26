import { getCommencementDate as getCommencementDateFromApi } from '../api/ordapi/getCommencementDate';
import { sessionKeys, getFromSessionOrApi } from './sessionHelper';

export const getCommencementDate = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const apiCall = async () => {
    const { orderId } = req.params;
    const { commencementDate } = await getCommencementDateFromApi({
      orderId,
      accessToken,
      logger,
    });
    return commencementDate;
  };

  const sessionData = { req, key: sessionKeys.plannedDeliveryDate };
  return getFromSessionOrApi({ sessionData, sessionManager, apiCall });
};
