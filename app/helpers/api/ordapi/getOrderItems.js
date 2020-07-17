import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderItemsEndpoint = (orderId, catalogueItemType) => {
  const queryString = (catalogueItemType !== undefined ? `?catalogueItemType=${catalogueItemType}` : '');
  return `${orderApiUrl}/api/v1/orders/${orderId}/order-items${queryString}`;
};

export const getOrderItems = async ({ orderId, catalogueItemType, accessToken }) => {
  const endpoint = getOrderItemsEndpoint(orderId, catalogueItemType);
  const orderItems = await getData({ endpoint, accessToken, logger });
  logger.info(`Found order items for type '${catalogueItemType}' and orderId '${orderId}'`);

  return orderItems;
};
