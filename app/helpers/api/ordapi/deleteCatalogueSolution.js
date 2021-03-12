import { deleteData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const deleteCatalogueSolutionEndpoint = (orderId, orderItemId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/order-items/${orderItemId}`
);

export const deleteCatalogueSolution = async ({ orderId, orderItemId, accessToken }) => {
  const endpoint = deleteCatalogueSolutionEndpoint(orderId, orderItemId);

  await deleteData({ endpoint, accessToken, logger });

  logger.info(`Delete catalogue solution ${orderItemId} returned for order ${orderId}`);
  return { success: true };
};
