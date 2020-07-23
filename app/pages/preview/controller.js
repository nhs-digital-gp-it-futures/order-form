import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../endpoints';
import { logger } from '../../logger';
import { getContext } from './contextCreator';
import { createServiceRecipientsDict } from './helpers/createServiceRecipientsDict';
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
  const serviceRecipients = createServiceRecipientsDict(orderData.serviceRecipients);
  const { recurringCostItems, oneOffCostItems } = transformOrderItems(orderData.orderItems);

  return getContext({
    orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
  });
};
