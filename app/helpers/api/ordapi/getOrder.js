import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import { sortItems } from '../../common/sortItems';

const getOrderEndpoint = (orderId) => `${orderApiUrl}/api/v1/orders/${orderId}`;

const isOneOff = (orderItem) => orderItem.catalogueItemType.toLowerCase() === 'AssociatedService'.toLowerCase()
    && orderItem.provisioningType.toLowerCase() === 'Declarative'.toLowerCase();

const transformOrderItems = (orderItems = []) => {
  const oneOffCostItems = orderItems.filter((o) => isOneOff(o));
  const recurringCostItems = orderItems.filter((o) => !isOneOff(o));

  return { oneOffCostItems, recurringCostItems };
};

export const sortServiceRecipients = (serviceRecipients) => sortItems(serviceRecipients, 'name');

export const sortGroupedOrderItems = (groupedOrderItems) => sortItems(groupedOrderItems, 'catalogueItemName');

export const groupOrderItemsByOdsCode = (orderItems) => (
  orderItems.reduce((groupedOrderItems, orderItem) => {
    const odsCode = orderItem.serviceRecipientsOdsCode;

    const accumulatedOrderItems = groupedOrderItems[odsCode]
      ? groupedOrderItems[odsCode].concat(orderItem)
      : [orderItem];

    return {
      ...groupedOrderItems,
      [odsCode]: accumulatedOrderItems,
    };
  }, {})
);

export const sortOrderItems = (serviceRecipients, orderItems) => {
  const sortedServiceRecipients = sortServiceRecipients(serviceRecipients);
  const groupedOrderItems = groupOrderItemsByOdsCode(orderItems);

  return sortedServiceRecipients
    .reduce((items, sortedServiceRecipient) => {
      const sortedGroupedOrderItems = groupedOrderItems[sortedServiceRecipient.odsCode]
        && sortGroupedOrderItems(groupedOrderItems[sortedServiceRecipient.odsCode]);

      return groupedOrderItems[sortedServiceRecipient.odsCode]
        ? items.concat(sortedGroupedOrderItems)
        : items;
    }, []);
};

export const getOrder = async ({ orderId, accessToken }) => {
  const endpoint = getOrderEndpoint(orderId);
  const orderData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`Order data returned for ${orderId}`);

  if (orderData.orderItems && orderData.orderItems.length > 0) {
    const sortedOrderItems = sortItems(orderData.orderItems, 'catalogueItemName');

    sortedOrderItems.forEach((o) => {
      const orderItem = o;
      orderItem.serviceRecipients = sortItems(orderItem.serviceRecipients, 'name');
    });

    const { recurringCostItems, oneOffCostItems } = transformOrderItems(sortedOrderItems);

    return {
      orderData, oneOffCostItems, recurringCostItems,
    };
  }
  return {
    orderData, oneOffCostItems: [], recurringCostItems: [], serviceRecipients: {},
  };
};
