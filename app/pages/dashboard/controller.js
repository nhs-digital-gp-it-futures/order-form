import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { logger } from '../../logger';
import { getEndpoint } from '../../endpoints';

export const getDashboardContext = async ({ orgName, orgId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrders', options: { orgId } });
  const ordersData = await getData({ endpoint, accessToken, logger });
  logger.info(`${ordersData ? ordersData.length : 'No'} orders found`);
  return getContext({ orgName, ordersData: ordersData || [] });
};
