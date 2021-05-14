import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems, odsCode }) => {
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
      href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/${orderItem.catalogueItemId}`,
      dataTestId: `${orderItem.catalogueItemId}-catalogueItemName`,
    }));
    columns.push(({
      data: orderItem.provisioningType === 'OnDemand'
        ? `${orderItem.itemUnit.description}`
        : `${orderItem.itemUnit.description} ${orderItem.timeUnit.description}`,
      dataTestId: `${orderItem.catalogueItemId}-unitOfOrder`,
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
        dataTestId: `${orderItem.catalogueItemId}-serviceRecipients`,
        title: 'Service recipients (ODS code)',
        innerComponent: serviceRecipients.join('<br><br>'),
      },
    }));
    items.push(columns);
  });
  return items;
};

const generateAddedOrderItemsTable = ({
  orderId, addedOrderItemsTable, orderItems, odsCode,
}) => {
  const items = generateItems({ orderId, orderItems, odsCode });

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

export const getContext = ({
  orderId, orderDescription, orderItems = [], odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedOrderItemsTable: generateAddedOrderItemsTable({
    orderId, addedOrderItemsTable: manifest.addedOrderItemsTable, orderItems, odsCode,
  }),
  addOrderItemButtonHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution`,
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
  orderItems,
});
