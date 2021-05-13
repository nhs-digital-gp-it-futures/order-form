import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems, odsCode }) => {
  const items = orderItems.map((orderItem) => {
    const columns = [];
    columns.push(({
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/${orderItem.catalogueItemId}`,
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

const generateAddedOrderItemsTable = ({
  orderId, addedOrderItemsTable, orderItems, odsCode,
}) => ({
  ...addedOrderItemsTable,
  items: generateItems({ orderId, orderItems, odsCode }),
});

export const getContext = ({
  orderId, orderDescription, orderItems = [], odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedOrderItemsTable: generateAddedOrderItemsTable({
    orderId, addedOrderItemsTable: manifest.addedOrderItemsTable, orderItems, odsCode,
  }),
  addOrderItemButtonHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/select/associated-service`,
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
  orderItems,
});
