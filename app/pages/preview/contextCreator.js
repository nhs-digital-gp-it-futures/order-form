import manifest from './manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/dateFormatter';

const generateCallOffColumn = ({ orderPartyData }) => {
  return ({
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
};

const generateSupplierColumn = ({ supplierData }) => {
  return ({
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
};

const generateCallOffAndSuppliersItemsTable = ({
  callOffAndSupplierTable, orderPartyData, supplierData,
}) => {
  const columns = [];
  if (orderPartyData) columns.push(generateCallOffColumn({ orderPartyData }));
  if (supplierData) columns.push(generateSupplierColumn({ supplierData }));

  return ({
    ...callOffAndSupplierTable,
    items: [columns],
  });
};

const getCurrentDate = () => formatDate(new Date(Date.now()));

export const getContext = ({ orderId, orderData }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  orderDescription: orderData.description,
  dateSummaryCreated: getCurrentDate(),
  callOffAndSupplierTable: generateCallOffAndSuppliersItemsTable({
    callOffAndSupplierTable: manifest.callOffAndSupplierTable,
    orderPartyData: orderData.orderParty,
    supplierData: orderData.supplier,
  }),
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});
