import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../endpoints';
import { logger } from '../../logger';

export const getOrder = async ({ orderId, accessToken }) => {
  const getOrderEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrder', options: { orderId } });
  const orderData = await getData({
    endpoint: getOrderEndpoint, accessToken, logger,
  });

  return orderData;
};
