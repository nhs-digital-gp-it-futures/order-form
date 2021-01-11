import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderStatusEndpoint = (orderId) => `${orderApiUrl}/api/v1/orders/${orderId}/status`;

export const putOrderStatus = async ({ orderId, accessToken }) => {
  const endpoint = getOrderStatusEndpoint(orderId);

  const body = {
    status: 'Complete',
  };

  await putData({
    endpoint, body, accessToken, logger,
  });

  logger.info(`Updated order status to 'complete' for orderId '${orderId}'`);
  return { success: true };
};
