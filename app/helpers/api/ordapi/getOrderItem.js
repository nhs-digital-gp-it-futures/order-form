import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

export const getOrderItem = async ({ orderId, catalogueSolutionId, accessToken }) => {
  const endpoint = `${orderApiUrl}/api/v1/orders/${orderId}/order-items/${catalogueSolutionId}`;
  const catalogueOrderItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Catalogue order item returned for ${catalogueSolutionId}`);

  return catalogueOrderItem;
};
