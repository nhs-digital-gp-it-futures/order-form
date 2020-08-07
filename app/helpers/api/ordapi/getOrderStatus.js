import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderStatusEndpoint = orderId => `${orderApiUrl}/api/v1/orders/${orderId}/status`;

export const getOrderStatus = async ({ orderId, accessToken }) => {
  const endpoint = getOrderStatusEndpoint(orderId);
  const orderStatusData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`Order status data returned for '${orderId}'`);

  return {
    orderStatus: orderStatusData.status,
  };
};
