import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderDescriptionEndpoint = orderId => `${orderApiUrl}/api/v1/orders/${orderId}/sections/description`;

export const getOrderDescription = async ({ orderId, accessToken }) => {
  const endpoint = getOrderDescriptionEndpoint(orderId);
  const data = await getData({ endpoint, accessToken, logger });
  logger.info(`Found order description '${data ? data.description : ''}' for order with ID '${orderId}'`);

  return data;
};
