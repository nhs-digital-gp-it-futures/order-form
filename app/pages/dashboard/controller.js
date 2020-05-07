import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { logger } from '../../logger';
import { getEndpoint } from '../../endpoints';

// const mockOrdersData = [
//   {
//     orderId: 'C0000014-01',
//     orderDescription: 'Some Order',
//     lastUpdatedBy: 'Alice Smith',
//     lastUpdated: '2020-05-06T11:29:52.4965647Z',
//     dateCreated: '2020-01-06T09:29:52.4965653Z',
//     status: 'Unsubmitted',
//   },
//   {
//     orderId: 'C000012-01',
//     orderDescription: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean m',
//     lastUpdatedBy: 'Bobbybobbybobby Smithsmith-Smithsmith-Smithsmith',
//     lastUpdated: '2020-12-09T09:29:52.49657Z',
//     dateCreated: '2020-10-09T09:29:52.4965701Z',
//     status: 'Submitted',
//   },
// ];

export const getDashboardContext = async ({ orgId, accessToken }) => {
  const ordersData = await getData({ endpoint: getEndpoint({ endpointLocator: 'getOrders' }), accessToken, logger });
  // const ordersData = mockOrdersData;
  logger.info(`${ordersData ? ordersData.length : 'No'} orders found`);
  return getContext({ orgId, ordersData: ordersData || [] });
};
