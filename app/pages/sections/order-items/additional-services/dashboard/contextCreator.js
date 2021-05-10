import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateItems = ({ orderId, orderItems, odsCode }) => {
  const items = orderItems.map((orderItem) => {
    const columns = [];
    columns.push(({
      data: orderItem.catalogueItemName,
      href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/${orderItem.catalogueItemId}`,
      dataTestId: `${orderItem.catalogueItemId}-catalogueItemName`,
    }));
    columns.push(({
      data: orderItem.provisioningType === 'OnDemand'
        ? `${orderItem.itemUnit.description}`
        : `${orderItem.itemUnit.description} ${orderItem.timeUnit.description}`,
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

const generateAddedOrderItemsTable = ({
  orderId, addedOrderItemsTable, orderItems, odsCode,
}) => ({
  ...addedOrderItemsTable,
  items: generateItems({ orderId, orderItems, odsCode }),
});

export const backLinkHref = ({
  req, selectedPrice, orderId, catalogueItemExists, odsCode,
}) => {
  const { referer } = req.headers;
  const slug = (referer ? referer.split('/').pop() : '').toLowerCase();
  const newItemBackLink = selectedPrice.provisioningType === 'Patient'
    ? `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients/date`
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/${selectedPrice.type.toLowerCase()}/${selectedPrice.provisioningType.toLowerCase()}`;
  const existingItemBackLink = catalogueItemExists
    ? `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service`
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`;

  const slugConditions = ['additional-services', 'date', 'ondemand', 'declarative', 'additional-service'];
  if (slugConditions.includes(slug)) {
    return referer;
  }

  return slug === 'neworderitem'
    ? newItemBackLink
    : existingItemBackLink;
};

export const deleteButtonLink = ({
  orderId, catalogueItemId, solutionName, odsCode,
}) => `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/delete/${catalogueItemId}/confirmation/${solutionName}`;

export const editRecipientsLink = (orderId, odsCode) => `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`;

export const getContext = ({
  orderId, orderDescription, orderItems = [], odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription,
  addedOrderItemsTable: generateAddedOrderItemsTable({
    orderId, addedOrderItemsTable: manifest.addedOrderItemsTable, orderItems, odsCode,
  }),
  addOrderItemButtonHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service`,
  backLinkHref: `${baseUrl}/organisation/${odsCode}/${orderId}`,
  orderItems,
});
