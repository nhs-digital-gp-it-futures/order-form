import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../endpoints';
import { logger } from '../../logger';
import { getContext } from './contextCreator';
import { getServiceRecipients } from './helpers/getServiceRecipients';
import { transformOrderItems } from './helpers/transformOrderItems';

export const getOrder = async ({ orderId, accessToken }) => {
  const getOrderEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getOrder', options: { orderId } });
  const orderData = await getData({
    endpoint: getOrderEndpoint, accessToken, logger,
  });
  logger.info(`Order data returned for ${orderId}`);

  return orderData;
};

export const getPreviewPageContext = ({ orderId, orderData }) => {
  const serviceRecipients = getServiceRecipients(orderData.serviceRecipients);
  const { recurringCostItems } = transformOrderItems(orderData.orderItems);

  return getContext({
    orderId, orderData, recurringCostItems, serviceRecipients,
  });
};
