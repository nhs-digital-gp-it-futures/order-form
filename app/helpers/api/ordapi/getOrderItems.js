import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { getEndpoint } from '../../../endpoints';

export const getOrderItems = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrderItems', options: { orderId } });
  const orderItems = await getData({ endpoint, accessToken, logger });
  logger.info(`Order items returned for orderId ${orderId}`);

  return orderItems;
};
