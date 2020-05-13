import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../endpoints';
import { logger } from '../../logger';

const getNewOrderTaskListPageContext = ({ orderId }) => getContext({ orderId });

const getExistingOrderTaskListPageContext = async ({ accessToken, orderId }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getOrderSummary', options: { orderId } });
  const order = await getData({ endpoint, accessToken, logger });
  logger.info('Existing order returned');
  return getContext({ orderId, orderDescription: order.description });
};

export const getOrderTaskListPageContext = ({ accessToken, orderId }) => {
  if (orderId === 'neworder') {
    return getNewOrderTaskListPageContext({ orderId });
  }
  return getExistingOrderTaskListPageContext({ accessToken, orderId });
};
