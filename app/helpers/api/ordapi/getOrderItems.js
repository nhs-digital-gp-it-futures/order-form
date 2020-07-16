import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { getEndpoint } from '../../../endpoints';

export const getOrderItems = async ({ orderId, catalogueItemType, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrderItems', options: { orderId, catalogueItemType } });
  const orderItems = await getData({ endpoint, accessToken, logger });
  logger.info(`Found order items for type '${catalogueItemType}' and orderId '${orderId}'`);

  return orderItems;
};
