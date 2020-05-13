import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../endpoints';
import { logger } from '../../logger';

export const getNewOrderPageContext = () => getContext({ orderId: 'neworder' });

export const getExistingOrderPageContext = async ({ accessToken, orderId }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getExistingOrder', options: { orderId } });
  const order = await getData({ endpoint, accessToken, logger });
  logger.info('Existing order returned');
  return getContext({ orderId, orderDescription: order.description });
};
