import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems }) => {
  const items = orderItems.map((orderItem) => {
    const columns = [];
    columns.push(({
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${orderId}/associated-services/${orderItem.catalogueItemId}`,
      dataTestId: `${orderItem.catalogueItemId}-catalogueItemName`,
    }));
    columns.push(({
      data: orderItem.timeUnit
        ? `${orderItem.itemUnit.description} ${orderItem.timeUnit.description}` : `${orderItem.itemUnit.description}`,
      dataTestId: `${orderItem.catalogueItemId}-unitoforder`,
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
  addOrderItemButtonHref: `${baseUrl}/organisation/${orderId}/associated-services/select/associated-service`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
  orderItems,
});
