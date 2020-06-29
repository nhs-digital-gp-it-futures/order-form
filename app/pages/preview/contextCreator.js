import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';

const generateCallOffPartyDetails = ({ orderPartyData }) => ({
  multiLine: {
    data: [
      `${orderPartyData.primaryContact.firstName} ${orderPartyData.primaryContact.lastName}`,
      orderPartyData.name,
      orderPartyData.odsCode,
      '',
      orderPartyData.address.line1,
      orderPartyData.address.line2,
      orderPartyData.address.line3,
      orderPartyData.address.line4,
      orderPartyData.address.line5,
      orderPartyData.address.town,
      orderPartyData.address.county,
      orderPartyData.address.postcode,
      orderPartyData.address.country,
    ].filter(lineItem => lineItem !== undefined),
    dataTestId: 'call-off-party',
  },
});

const generateSupplierDetails = ({ supplierData }) => ({
  multiLine: {
    data: [
      `${supplierData.primaryContact.firstName} ${supplierData.primaryContact.lastName}`,
      supplierData.name,
      '',
      supplierData.address.line1,
      supplierData.address.line2,
      supplierData.address.line3,
      supplierData.address.line4,
      supplierData.address.line5,
      supplierData.address.town,
      supplierData.address.county,
      supplierData.address.postcode,
      supplierData.address.country,
    ].filter(lineItem => lineItem !== undefined),
    dataTestId: 'supplier',
  },
});

const generateCallOffAndSupplierDetailsTable = ({
  callOffAndSupplierTable, orderPartyData, supplierData,
}) => {
  const columns = [];
  if (orderPartyData) columns.push(generateCallOffPartyDetails({ orderPartyData }));
  if (supplierData) columns.push(generateSupplierDetails({ supplierData }));

  return ({
    ...callOffAndSupplierTable,
    items: [columns],
  });
};

const getCurrentDate = () => formatDate(new Date(Date.now()));

const generateRecurringCostDetailsTable = ({
  recurringCostTable, recurringCostItems = [], serviceRecipients,
}) => {
  const items = recurringCostItems.map((item) => {
    const columns = [];

    const serviceRecipient = serviceRecipients.find(
      recipient => recipient.odsCode === item.serviceRecipientsOdsCode,
    );

    columns.push(({
      data: `${serviceRecipient.name} (${serviceRecipient.odsCode})`,
      dataTestId: 'recipient-name',
    }));

    columns.push(({
      data: item.itemId,
      dataTestId: 'item-id',
    }));

    columns.push(({
      data: item.catalogueItemName,
      dataTestId: 'item-name',
    }));

    columns.push(({
      data: `£${item.price.toLocaleString()} ${item.itemUnitDescription} ${item.timeUnitDescription}`,
      dataTestId: 'price-unit',
    }));

    columns.push(({
      data: `${item.quantity.toLocaleString()} ${item.quantityPeriodDescription}`,
      dataTestId: 'quantity',
    }));

    columns.push(({
      data: formatDate(item.deliveryDate),
      dataTestId: 'planned-date',
    }));

    columns.push(({
      data: `${item.costPerYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      dataTestId: 'item-cost',
    }));

    return columns;
  });

  return ({
    ...recurringCostTable,
    items,
  });
};

export const getContext = ({ orderId, orderData, recurringCostItems }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription: orderData.description,
  dateSummaryCreated: getCurrentDate(),
  callOffAndSupplierTable: generateCallOffAndSupplierDetailsTable({
    callOffAndSupplierTable: manifest.callOffAndSupplierTable,
    orderPartyData: orderData.orderParty,
    supplierData: orderData.supplier,
  }),
  recurringCostTable: generateRecurringCostDetailsTable({
    recurringCostTable: manifest.recurringCostTable,
    recurringCostItems,
    serviceRecipients: orderData.serviceRecipients,
  }),
  commencementDate: formatDate(orderData.commencementDate),
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
