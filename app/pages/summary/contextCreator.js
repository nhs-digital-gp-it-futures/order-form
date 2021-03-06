import incompleteManifest from './incomplete/manifest.json';
import completeManifest from './complete/manifest.json';
import { baseUrl } from '../../config';
import { formatDate } from '../../helpers/common/dateFormatter';
import { formatPrice } from '../../helpers/common/priceFormatter';
import { logger } from '../../logger';

const generateCallOffPartyDetails = ({ orderPartyData }) => {
  if (orderPartyData && orderPartyData.primaryContact && orderPartyData.address) {
    return {
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
        ].filter((lineItem) => lineItem !== undefined),
        dataTestId: 'call-off-party',
      },
    };
  }
  return { multiLine: { data: [''] }, dataTestId: 'call-off-party' };
};

const generateSupplierDetails = ({ supplierData }) => {
  if (supplierData && supplierData.primaryContact && supplierData.address) {
    return {
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
        ].filter((lineItem) => lineItem !== undefined),
        dataTestId: 'supplier',
      },
    };
  }
  return { multiLine: { data: [''] }, dataTestId: 'supplier' };
};

const generateCallOffAndSupplierDetailsTable = ({
  callOffAndSupplierTable, orderPartyData, supplierData,
}) => {
  const columns = [];
  columns.push(generateCallOffPartyDetails({ orderPartyData }));
  columns.push(generateSupplierDetails({ supplierData }));
  return ({
    ...callOffAndSupplierTable,
    items: [columns],
  });
};

const generateRowForTotal = ({
  labelCellData,
  labelCellClasses,
  labelCellTestId,
  labelHideSeperator,
  valueCellData,
  valueCellClasses,
  valueCellTestId,
  valueHideSeperator,
  showValueColumn = true,
}) => {
  const columns = [];

  columns.push({
    data: labelCellData,
    classes: labelCellClasses,
    dataTestId: labelCellTestId,
    hideSeperator: labelHideSeperator,
  });

  if (showValueColumn) {
    columns.push({
      data: valueCellData !== undefined
        ? formatPrice({ value: valueCellData, maximumFractionDigits: 2 })
        : '0.00',
      classes: valueCellClasses,
      dataTestId: valueCellTestId,
      hideSeperator: valueHideSeperator,
    });
  } else {
    columns.push({
      data: '',
      dataTestId: 'blank-cell',
      hideSeperator: valueHideSeperator,
    });
  }

  return columns;
};

const generateoneOffCostTableFooter = ({
  oneOffCostTableFooter, oneOffCostTotalValue,
}) => {
  const items = [];
  items.push(
    generateRowForTotal({
      labelCellData: oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.data,
      labelCellClasses: oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.classes,
      labelCellTestId: 'total-cost-label',
      labelHideSeperator: oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.hideSeperator,
      valueCellData: oneOffCostTotalValue,
      valueCellClasses: oneOffCostTableFooter.cellInfo.totalOneOffCostValue.classes,
      valueCellTestId: 'total-cost-value',
      valueHideSeperator: oneOffCostTableFooter.cellInfo.totalOneOffCostValue.hideSeperator,
    }),
  );

  return ({
    ...oneOffCostTableFooter,
    items,
  });
};

const generaterecurringCostTableFooter = ({
  recurringCostTableFooter, recurringYearCost, recurringMonthCost, ownershipCost,
}) => {
  const items = [];
  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTableFooter.cellInfo.totalOneYearCostLabel.data,
      labelCellClasses: recurringCostTableFooter.cellInfo.totalOneYearCostLabel.classes,
      labelCellTestId: 'total-year-cost-label',
      labelHideSeperator: recurringCostTableFooter.cellInfo.totalOneYearCostLabel.hideSeperator,
      valueCellData: recurringYearCost,
      valueCellClasses: recurringCostTableFooter.cellInfo.totalOneYearCostValue.classes,
      valueCellTestId: 'total-year-cost-value',
      valueHideSeperator: recurringCostTableFooter.cellInfo.totalOneYearCostValue.hideSeperator,
    }),
  );

  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.data,
      labelCellClasses: recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.classes,
      labelCellTestId: 'total-monthly-cost-label',
      labelHideSeperator: recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.hideSeperator,
      valueCellData: recurringMonthCost,
      valueCellClasses: recurringCostTableFooter.cellInfo.totalMonthlyCostValue.classes,
      valueCellTestId: 'total-monthly-cost-value',
      valueHideSeperator: recurringCostTableFooter.cellInfo.totalMonthlyCostValue.hideSeperator,
    }),
  );

  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.data,
      labelCellClasses: recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.classes,
      labelCellTestId: 'total-ownership-cost-label',
      labelHideSeperator: recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.hideSeperator,
      valueCellData: ownershipCost,
      valueCellClasses: recurringCostTableFooter.cellInfo.totalOwnershipCostValue.classes,
      valueCellTestId: 'total-ownership-cost-value',
      valueHideSeperator: recurringCostTableFooter.cellInfo.totalOwnershipCostValue.hideSeperator,
    }),
  );

  items.push(
    generateRowForTotal({
      labelCellData: recurringCostTableFooter.cellInfo.totalOwnershipTerms.data,
      labelCellClasses: recurringCostTableFooter.cellInfo.totalOwnershipTerms.classes,
      labelCellTestId: 'total-ownership-terms',
      labelHideSeperator: recurringCostTableFooter.cellInfo.totalOwnershipTerms.hideSeperator,
      valueHideSeperator: recurringCostTableFooter.cellInfo.totalOwnershipTerms.hideSeperator,
      showValueColumn: false,
    }),
  );

  return ({
    ...recurringCostTableFooter,
    items,
  });
};

const getCurrentDate = () => formatDate(new Date(Date.now()));

const generateRecurringCostDetailsTable = ({
  recurringCostTable, recurringCostItems = [],
}) => {
  const items = [];
  recurringCostItems.forEach((item) => {
    if (!item.serviceRecipients || item.serviceRecipients.length < 1) {
      logger.error(`no service recipient found for ${item.catalogueItemName}`);
      throw new Error();
    }

    item.serviceRecipients.forEach((serviceRecipient) => {
      const columns = [];
      columns.push(({
        classes: recurringCostTable.cellInfo.recipientName.classes,
        data: `${serviceRecipient.name} (${serviceRecipient.odsCode})`,
        dataTestId: 'recipient-name',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.itemId.classes,
        data: serviceRecipient.itemId,
        dataTestId: 'item-id',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.itemName.classes,
        data: item.catalogueItemName,
        dataTestId: 'item-name',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.serviceInstanceId.classes,
        data: serviceRecipient.serviceInstanceId,
        dataTestId: 'service-instance-id',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.priceUnit.classes,
        data: `${formatPrice({ value: item.price })} ${item.itemUnitDescription} ${item.provisioningType !== 'OnDemand' && item.timeUnitDescription ? item.timeUnitDescription : ''}`,
        dataTestId: 'price-unit',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.quantity.classes,
        data: `${serviceRecipient.quantity.toLocaleString()} ${item.quantityPeriodDescription ? item.quantityPeriodDescription : ''}`,
        dataTestId: 'quantity',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.plannedDeliveryDate.classes,
        data: formatDate(serviceRecipient.deliveryDate),
        dataTestId: 'planned-date',
      }));

      columns.push(({
        classes: recurringCostTable.cellInfo.itemCost.classes,
        data: formatPrice({ value: serviceRecipient.costPerYear, maximumFractionDigits: 2 }),
        dataTestId: 'costPerYear',
      }));

      items.push(columns);
    });
  });

  return ({
    ...recurringCostTable,
    items,
  });
};

const generateOneOffCostDetailsTable = ({
  oneOffCostTable, oneOffCostItems = [],
}) => {
  const items = [];
  oneOffCostItems.map((item) => {
    if (!item.serviceRecipients || item.serviceRecipients.length < 1) {
      logger.error(`no service recipient found for ${item.itemId}`);
      throw new Error();
    }

    item.serviceRecipients.forEach((serviceRecipient) => {
      const columns = [];

      columns.push(({
        classes: oneOffCostTable.cellInfo.recipientName.classes,
        data: `${serviceRecipient.name} (${serviceRecipient.odsCode})`,
        dataTestId: 'recipient-name',
      }));

      columns.push(({
        classes: oneOffCostTable.cellInfo.itemId.classes,
        data: serviceRecipient.itemId,
        dataTestId: 'item-id',
      }));

      columns.push(({
        classes: oneOffCostTable.cellInfo.itemName.classes,
        data: item.catalogueItemName,
        dataTestId: 'item-name',
      }));

      columns.push(({
        classes: oneOffCostTable.cellInfo.priceUnit.classes,
        data: `${formatPrice({ value: item.price })} ${item.itemUnitDescription} ${item.timeUnitDescription ? item.timeUnitDescription : ''}`,
        dataTestId: 'price-unit',
      }));

      columns.push(({
        classes: oneOffCostTable.cellInfo.quantity.classes,
        data: `${serviceRecipient.quantity.toLocaleString()} ${item.quantityPeriodDescription ? item.quantityPeriodDescription : ''}`,
        dataTestId: 'quantity',
      }));

      columns.push(({
        classes: oneOffCostTable.cellInfo.itemCost.classes,
        data: formatPrice({ value: item.costPerYear, maximumFractionDigits: 2 }),
        dataTestId: 'item-cost',
      }));

      items.push(columns);
    });
  });

  return ({
    ...oneOffCostTable,
    items,
  });
};

export const getContext = ({
  orderId, orderData, oneOffCostItems, recurringCostItems, odsCode,
}) => {
  const manifest = orderData.status === 'Complete' ? completeManifest : incompleteManifest;

  return ({
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    orderDescription: orderData.description,
    dateSummaryCreated: getCurrentDate(),
    dateCompleted: formatDate(orderData.dateCompleted),
    callOffAndSupplierTable: generateCallOffAndSupplierDetailsTable({
      callOffAndSupplierTable: manifest.callOffAndSupplierTable,
      orderPartyData: orderData.orderParty,
      supplierData: orderData.supplier,
    }),
    oneOffCostTable: generateOneOffCostDetailsTable({
      oneOffCostTable: manifest.oneOffCostTable,
      oneOffCostItems,
    }),
    oneOffCostTableFooter: generateoneOffCostTableFooter({
      oneOffCostTableFooter: manifest.oneOffCostTableFooter,
      oneOffCostTotalValue: orderData.totalOneOffCost,
    }),
    recurringCostTable: generateRecurringCostDetailsTable({
      recurringCostTable: manifest.recurringCostTable,
      recurringCostItems,
    }),
    recurringCostTableFooter: generaterecurringCostTableFooter({
      recurringCostTableFooter: manifest.recurringCostTableFooter,
      recurringYearCost: orderData.totalRecurringCostPerYear,
      recurringMonthCost: orderData.totalRecurringCostPerMonth,
      ownershipCost: orderData.totalOwnershipCost,
    }),
    commencementDate: formatDate(orderData.commencementDate),
    backLinkHref: orderData.status === 'Complete' ? `${baseUrl}/organisation/${odsCode}` : `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
    orderSummaryButtonHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/summary?print=true`,
  });
};
