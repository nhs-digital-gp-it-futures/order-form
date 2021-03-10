import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems }) => {
  const items = [];
  const catalogueIds = [];
  orderItems.forEach((orderItem) => {
    if (catalogueIds.includes(orderItem.catalogueItemId)) {
      return;
    }
    catalogueIds.push(orderItem.catalogueItemId);
    const columns = [];
    columns.push(({
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${orderId}/catalogue-solutions/${orderItem.orderItemId}`,
      dataTestId: `${orderItem.orderItemId}-catalogueItemName`,
    }));
    columns.push(({
      data: `${orderItem.itemUnit.description} ${orderItem.timeUnit.description}`,
      dataTestId: `${orderItem.orderItemId}-unitOfOrder`,
    }));

    const serviceRecipients = [];
    orderItems.forEach(
      (orderItemFiltered) => {
        if (orderItemFiltered.catalogueItemId === orderItem.catalogueItemId) {
          const filteredServiceRecipients = orderItemFiltered.serviceRecipients;
          filteredServiceRecipients.forEach(
            (serviceRecipient) => {
              serviceRecipients.push(`${serviceRecipient.name} (${serviceRecipient.odsCode})`);
            },
          );
        }
      },
    );
    columns.push(({
      expandableSection: {
        dataTestId: `${orderItem.orderItemId}-serviceRecipients`,
        title: 'Service recipients (ODS code)',
        innerComponent: serviceRecipients.join('<br><br>'),
      },
    }));
    items.push(columns);
  });
  return items;
};

const generateAddedOrderItemsTable = ({ orderId, addedOrderItemsTable, orderItems }) => {
  const items = generateItems({ orderId, orderItems });

  items.sort((a, b) => {
    if (a[0].data < b[0].data) { return -1; }
    if (a[0].data > b[0].data) { return 1; }
    return 0;
  });

  return {
    ...addedOrderItemsTable,
    items,
  };
};

export const getContext = ({ orderId, orderDescription, orderItems = [] }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedOrderItemsTable: generateAddedOrderItemsTable({
    orderId, addedOrderItemsTable: manifest.addedOrderItemsTable, orderItems,
  }),
  addOrderItemButtonHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
