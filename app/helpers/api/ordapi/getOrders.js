import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrdersEndpoint = orgId => `${orderApiUrl}/api/v1/organisations/${orgId}/orders`;

const isComplete = order => order.status.toLowerCase() === 'Complete'.toLowerCase();

export const groupOrdersByStatus = (orders) => {
  const completedOrders = orders.filter(o => isComplete(o));
  const incompletedOrders = orders.filter(o => !isComplete(o));

  return { completedOrders, incompletedOrders };
};

export const getOrders = async ({ orgId, accessToken }) => {
  const endpoint = getOrdersEndpoint(orgId);
  const ordersData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`${ordersData ? ordersData.length : 'No'} orders found`);

  const { completedOrders, incompletedOrders } = groupOrdersByStatus(ordersData);

  return { completedOrders, incompletedOrders };
};
