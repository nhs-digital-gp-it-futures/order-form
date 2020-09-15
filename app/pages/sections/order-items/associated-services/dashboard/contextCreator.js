import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems, addedOrderItemsTable }) => {
  const items = orderItems.map((orderItem) => {
    const columns = [];
    columns.push(({
      ...addedOrderItemsTable.cellInfo.catalogueItemName,
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${orderId}/associated-services/${orderItem.orderItemId}`,
      dataTestId: `${orderItem.orderItemId}-catalogueItemName`,
    }));
    return columns;
  });
  return items;
};

const generateAddedOrderItemsTable = ({ orderId, addedOrderItemsTable, orderItems }) => ({
  ...addedOrderItemsTable,
  items: generateItems({ orderId, orderItems, addedOrderItemsTable }),
});

export const getContext = ({ orderId, orderDescription, orderItems = [] }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedOrderItemsTable: generateAddedOrderItemsTable({
    orderId, addedOrderItemsTable: manifest.addedOrderItemsTable, orderItems,
  }),
  addOrderItemButtonHref: `${baseUrl}/organisation/${orderId}/associated-services/select/associated-service`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
