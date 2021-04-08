import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems }) => {
  const items = orderItems.map((orderItem) => {
    const columns = [];
    columns.push(({
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${orderId}/additional-services/${orderItem.catalogueItemId}`,
      dataTestId: `${orderItem.catalogueItemId}-catalogueItemName`,
    }));
    columns.push(({
      data: orderItem.timeUnit
        ? `${orderItem.itemUnit.description} ${orderItem.timeUnit.description}` : `${orderItem.itemUnit.description}`,
      dataTestId: `${orderItem.catalogueItemId}-unitoforder`,
    }));

    const serviceRecipients = orderItem.serviceRecipients.map((recipient) => `${recipient.name} (${recipient.odsCode})`);
    columns.push(({
      expandableSection: {
        dataTestId: `${orderItem.catalogueItemId}-serviceRecipients`,
        title: 'Service recipients (ODS code)',
        innerComponent: serviceRecipients.join('<br><br>'),
      },
    }));
    return columns;
  });
  return items;
};

const generateAddedOrderItemsTable = ({ orderId, addedOrderItemsTable, orderItems }) => ({
  ...addedOrderItemsTable,
  items: generateItems({ orderId, orderItems }),
});

export const backLinkHref = ({ req, orderId }) => {
  const { referer } = req.headers;
  const slug = referer.split('/').pop();

  return slug && slug.toLowerCase() === 'additional-services' ? referer
    : `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipients/date`;
};

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
