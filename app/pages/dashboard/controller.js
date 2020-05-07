import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { logger } from '../../logger';
import { getEndpoint } from '../../endpoints';

export const getDashboardContext = async ({ orgId, accessToken }) => {
  const ordersData = await getData({ endpoint: getEndpoint({ endpointLocator: 'getOrders' }), accessToken, logger });
  logger.info(`${ordersData ? ordersData.length : 'No'} orders found`);
  return getContext({ orgId, ordersData: ordersData || [] });
};
