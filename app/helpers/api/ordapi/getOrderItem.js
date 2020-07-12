import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { getEndpoint } from '../../../endpoints';

export const getOrderItem = async ({ orderId, orderItemId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrderItem', options: { orderId, orderItemId } });
  const catalogueOrderItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Catalogue order item returned for ${orderItemId}`);

  return catalogueOrderItem;
};
