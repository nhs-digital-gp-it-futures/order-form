import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../endpoints';
import { logger } from '../../logger';
import { getContext } from './contextCreator';

export const getOrder = async ({ orderId, accessToken }) => {
  const getOrderEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrder', options: { orderId } });
  const orderData = await getData({
    endpoint: getOrderEndpoint, accessToken, logger,
  });
  logger.info(`Order data returned for ${orderId}`);

  return orderData;
};

export const getPreviewPageContext = ({ orderId, orderData }) => (
  getContext({ orderId, orderData })
);
