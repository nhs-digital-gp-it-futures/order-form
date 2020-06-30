import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';
import { logger } from '../../logger';

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
  recurringCostTable, recurringCostItems = [], serviceRecipients = {},
}) => {
  const items = recurringCostItems.map((item) => {
    const classes = 'nhsuk-u-font-size-14';
    const columns = [];

    if (!serviceRecipients[item.serviceRecipientsOdsCode]) {
      logger.error(`service recipient ${item.serviceRecipientsOdsCode} not found`);
      throw new Error();
    }

    const serviceRecipient = serviceRecipients[item.serviceRecipientsOdsCode];

    columns.push(({
      classes,
      data: `${serviceRecipient.name} (${serviceRecipient.odsCode})`,
      dataTestId: 'recipient-name',
    }));

    columns.push(({
      classes,
      data: item.itemId,
      dataTestId: 'item-id',
    }));

    columns.push(({
      classes,
      data: item.catalogueItemName,
      dataTestId: 'item-name',
    }));

    columns.push(({
      classes,
      data: `${item.price.toLocaleString()} ${item.itemUnitDescription} ${item.timeUnitDescription}`,
      dataTestId: 'price-unit',
    }));

    columns.push(({
      classes,
      data: `${item.quantity.toLocaleString()} ${item.quantityPeriodDescription}`,
      dataTestId: 'quantity',
    }));

    columns.push(({
      classes,
      data: formatDate(item.deliveryDate),
      dataTestId: 'planned-date',
    }));

    columns.push(({
      classes: `${classes} bc-u-float-right`,
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

export const getContext = ({
  orderId, orderData, recurringCostItems, serviceRecipients,
}) => ({
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
    serviceRecipients,
  }),
  commencementDate: formatDate(orderData.commencementDate),
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
