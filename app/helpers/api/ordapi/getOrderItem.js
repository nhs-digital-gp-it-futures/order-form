import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderItemEndpoint = (orderId, orderItemId) => {
  return `${orderApiUrl}/api/v1/orders/${orderId}/order-items/${orderItemId}`;
};

export const getOrderItem = async ({ orderId, orderItemId, accessToken }) => {
  const endpoint = getOrderItemEndpoint(orderId, orderItemId);
  const catalogueOrderItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Catalogue order item returned for ${orderItemId}`);

  return catalogueOrderItem;
};
