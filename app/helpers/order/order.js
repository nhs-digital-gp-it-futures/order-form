import { getOrderDescription as getOrderDescriptionFromApi } from '../api/ordapi/getOrderDescription';

export const getOrderDescription = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const key = 'orderDescription';
  const storedDescription = sessionManager.getFromSession({ req, key });
  if (storedDescription) {
    return storedDescription;
  }

  const { orderId } = req.params;
  const { description } = await getOrderDescriptionFromApi({ orderId, accessToken, logger });

  sessionManager.saveToSession({ req, key, value: description });

  return description;
};
