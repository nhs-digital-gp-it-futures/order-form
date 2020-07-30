import { getOrderDescription as getOrderDescriptionFromApi } from '../api/ordapi/getOrderDescription';
import { getFromSessionOrApi } from './sessionHelper';

export const getOrderDescription = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const apiCall = async () => {
    const { orderId } = req.params;
    const { description } = await getOrderDescriptionFromApi({
      orderId,
      accessToken,
      logger,
    });

    return description;
  };

  const sessionData = { req, key: 'orderDescription' };
  return getFromSessionOrApi({ sessionData, sessionManager, apiCall });
};
