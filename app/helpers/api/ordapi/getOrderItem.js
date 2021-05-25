import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderItemEndpoint = (callOffId, catalogueItemId) => (
  `${orderApiUrl}/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`
);

export const getOrderItem = async ({ orderId, catalogueItemId, accessToken }) => {
  const endpoint = getOrderItemEndpoint(orderId, catalogueItemId);
  const catalogueOrderItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Catalogue order item returned for ${catalogueItemId}`);

  return catalogueOrderItem;
};
