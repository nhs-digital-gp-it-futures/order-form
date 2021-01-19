import { deleteData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const deleteOrderEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}`
);

export const deleteOrder = async ({ orderId, accessToken }) => {
  const endpoint = deleteOrderEndpoint(orderId);
  await deleteData({ endpoint, accessToken, logger });
  logger.info(`Delete order returned for ${orderId}`);

  return { success: true };
};
