import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderEndpoint = orderId => `${orderApiUrl}/api/v1/orders/${orderId}`;

const createServiceRecipientsDict = (serviceRecipients = []) => {
  const reducer = (dict, serviceRecipient) => (
    {
      ...dict,
      [serviceRecipient.odsCode]: serviceRecipient,
    });

  return serviceRecipients.reduce(reducer, {});
};

const isOneOff = orderItem => orderItem.catalogueItemType.toLowerCase() === 'AssociatedService'.toLowerCase()
    && orderItem.provisioningType.toLowerCase() === 'Declarative'.toLowerCase();

const transformOrderItems = (orderItems = []) => {
  const oneOffCostItems = orderItems.filter(o => isOneOff(o));
  const recurringCostItems = orderItems.filter(o => !isOneOff(o));

  return { oneOffCostItems, recurringCostItems };
};

export const sortServiceRecipients = (serviceRecipients) => {
  const sortedServiceRecipients = serviceRecipients.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return sortedServiceRecipients;
};

export const sortOrderItems = (serviceRecipients, orderItems) => {
  const a = Object.keys(serviceRecipients).reduce((items, serviceRecipientOdsCode) => {
    return items.concat(orderItems.filter(orderItem => orderItem.serviceRecipientsOdsCode === serviceRecipientOdsCode));
  }, []);

  return a;
};

export const getOrder = async ({ orderId, accessToken }) => {
  const endpoint = getOrderEndpoint(orderId);
  const orderData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`Order data returned for ${orderId}`);

  const serviceRecipients = createServiceRecipientsDict(orderData.serviceRecipients);
  const { recurringCostItems, oneOffCostItems } = transformOrderItems(orderData.orderItems);

  return {
    orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
  };
};
