import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrdersEndpoint = orgId => `${orderApiUrl}/api/v1/organisations/${orgId}/orders`;

export const getOrders = async ({ orgId, accessToken }) => {
  const endpoint = getOrdersEndpoint(orgId);
  const ordersData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`${ordersData ? ordersData.length : 'No'} orders found`);

  return ordersData;
};
