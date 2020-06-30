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

const generateOneOffCostTotalsTable = ({
  oneOffCostTotalsTable, oneOffCostTotalValue,
}) => {
  const columns = [];
  columns.push({
    data: '',
    dataTestId: 'blank-cell',
  });

  columns.push({
    data: 'Total one off cost (indicative)',
    classes: 'nhsuk-u-font-weight-bold bc-u-float-right nhsuk-u-font-size-16',
    dataTestId: 'total-cost-label',
  });

  columns.push({
    data: oneOffCostTotalValue !== undefined
      ? oneOffCostTotalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      })
      : '0.00',
    classes: 'nhsuk-u-font-weight-bold bc-u-float-right nhsuk-u-font-size-16',
    dataTestId: 'total-cost-value',
  });

  return ({
    ...oneOffCostTotalsTable,
    items: [columns],
  });
};

const getCurrentDate = () => formatDate(new Date(Date.now()));

export const getContext = ({ orderId, orderData }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription: orderData.description,
  dateSummaryCreated: getCurrentDate(),
  callOffAndSupplierTable: generateCallOffAndSupplierDetailsTable({
    callOffAndSupplierTable: manifest.callOffAndSupplierTable,
    orderPartyData: orderData.orderParty,
    supplierData: orderData.supplier,
  }),
  oneOffCostTotalsTable: generateOneOffCostTotalsTable({
    oneOffCostTotalsTable: manifest.oneOffCostTotalsTable,
    oneOffCostTotalValue: orderData.totalOneOffCost,
  }),
  commencementDate: formatDate(orderData.commencementDate),
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
