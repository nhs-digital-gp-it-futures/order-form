import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderEndpoint = orderId => `${orderApiUrl}/api/v1/orders/${orderId}`;

export const getOrder = async ({ orderId, accessToken }) => {
  const endpoint = getOrderEndpoint(orderId);
  const orderData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`Order data returned for ${orderId}`);

  return orderData;
};
