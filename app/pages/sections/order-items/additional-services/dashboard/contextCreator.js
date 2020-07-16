import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems }) => {
  const items = orderItems.map((orderItem) => {
    const columns = [];
    columns.push(({
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${orderId}/additional-services/${orderItem.orderItemId}`,
      dataTestId: `${orderItem.orderItemId}-catalogueItemName`,
    }));
    columns.push(({
      data: `${orderItem.serviceRecipient.name} (${orderItem.serviceRecipient.odsCode})`,
      dataTestId: `${orderItem.orderItemId}-serviceRecipient`,
    }));
    return columns;
  });
  return items;
};

const generateAddedOrderItemsTable = ({ orderId, addedOrderItemsTable, orderItems }) => ({
  ...addedOrderItemsTable,
  items: generateItems({ orderId, orderItems }),
});

export const getContext = ({ orderId, orderDescription, orderItems = [] }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedOrderItemsTable: generateAddedOrderItemsTable({
    orderId, addedOrderItemsTable: manifest.addedOrderItemsTable, orderItems,
  }),
  addOrderItemButtonHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
