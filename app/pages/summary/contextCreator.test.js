import incompleteManifest from './incomplete/manifest.json';
import completeManifest from './complete/manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order summary contextCreator', () => {
  describe('getContext', () => {
    const mockOrderData = { description: 'Some order description' };
    const mockCompletedOrderData = { description: 'Some order description', status: 'Complete', dateCompleted: '20 July 2020' };
    const mockEmptyCallOffPartyRow = { multiLine: { data: [''] }, dataTestId: 'call-off-party' };
    const mockEmptySupplierRow = { multiLine: { data: [''] }, dataTestId: 'supplier' };

    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.backLinkText).toEqual(incompleteManifest.backLinkText);
    });

    it('should construct the backLinkHref for a complete order', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, orderData: mockCompletedOrderData });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should construct the backLinkHref for an incomplete order', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, orderData: mockOrderData });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.title).toEqual(`${incompleteManifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.description).toEqual(incompleteManifest.description);
    });

    it('should return the description for a completed order', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockCompletedOrderData });
      expect(context.description).toEqual(completeManifest.description);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.orderDescriptionHeading).toEqual(incompleteManifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the order summary button href', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId, orderData: mockOrderData });
      expect(context.orderSummaryButtonHref).toEqual(`${baseUrl}/organisation/${orderId}/summary?print=true`);
    });

    it('should return the dateSummaryCreatedLabel', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.dateSummaryCreatedLabel).toEqual(incompleteManifest.dateSummaryCreatedLabel);
    });

    it('should return the dateSummaryCreated as the current date', () => {
      Date.now = jest.fn().mockReturnValue('2020-07-19T13:41:38.838Z');
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.dateSummaryCreated).toEqual('19 July 2020');
    });

    it('should return the dateCompletedLabel for a completed order', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockCompletedOrderData });
      expect(context.dateCompletedLabel).toEqual(completeManifest.dateCompletedLabel);
    });

    it('should return the mockCompletedOrderData as the provided date for a completed order', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockCompletedOrderData });
      expect(context.dateCompleted).toEqual('20 July 2020');
    });

    it('should return the callOffAndSupplierTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.callOffAndSupplierTable.columnInfo)
        .toEqual(incompleteManifest.callOffAndSupplierTable.columnInfo);
    });

    it('should return the callOffAndSupplierTable without items if orderData is empty', () => {
      const context = getContext({ orderId: 'order-1', orderData: {} });
      expect(context.callOffAndSupplierTable.items).toEqual(
        [[mockEmptyCallOffPartyRow, mockEmptySupplierRow]],
      );
    });

    it('should return the callOffAndSupplierTable with just call off items', () => {
      const expectedContext = {
        callOffAndSupplierTable: {
          ...incompleteManifest.callOffAndSupplierTable,
          items: [
            [
              {
                multiLine: {
                  data: [
                    'CallOffFirstName CallOffLastName',
                    'Call off org Name',
                    'A01',
                    '',
                    'Calloff First Line',
                    'Calloff Second Line',
                    'Calloff Town',
                    'CO12 1AA',
                  ],
                  dataTestId: 'call-off-party',
                },
              },
              mockEmptySupplierRow,
            ],
          ],
        },
      };

      const mockOrderDataWithCallOffAndSupplier = {
        ...mockOrderData,
        orderParty: {
          name: 'Call off org Name',
          odsCode: 'A01',
          address: {
            line1: 'Calloff First Line',
            line2: 'Calloff Second Line',
            town: 'Calloff Town',
            postcode: 'CO12 1AA',
          },
          primaryContact: {
            firstName: 'CallOffFirstName',
            lastName: 'CallOffLastName',
          },
        },
        supplier: {},
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderDataWithCallOffAndSupplier });
      expect(context.callOffAndSupplierTable).toEqual(expectedContext.callOffAndSupplierTable);
    });

    it('should return the callOffAndSupplierTable with just supplier items when supplier items are provided', () => {
      const expectedContext = {
        callOffAndSupplierTable: {
          ...incompleteManifest.callOffAndSupplierTable,
          items: [
            [
              mockEmptyCallOffPartyRow,
              {
                multiLine: {
                  data: [
                    'SuppFirstName SuppLastName',
                    'Supplier Name',
                    '',
                    'Supplier First Line',
                    'Supplier Second Line',
                    'Supplier Town',
                    'SU12 1AA',
                  ],
                  dataTestId: 'supplier',
                },
              },
            ],
          ],
        },
      };

      const mockOrderDataWithCallOffAndSupplier = {
        ...mockOrderData,
        orderParty: {},
        supplier: {
          name: 'Supplier Name',
          address: {
            line1: 'Supplier First Line',
            line2: 'Supplier Second Line',
            town: 'Supplier Town',
            postcode: 'SU12 1AA',
          },
          primaryContact: {
            firstName: 'SuppFirstName',
            lastName: 'SuppLastName',
          },
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderDataWithCallOffAndSupplier });
      expect(context.callOffAndSupplierTable).toEqual(expectedContext.callOffAndSupplierTable);
    });

    it('should return the callOffAndSupplierTable with items when order items are provided', () => {
      const expectedContext = {
        callOffAndSupplierTable: {
          ...incompleteManifest.callOffAndSupplierTable,
          items: [
            [
              {
                multiLine: {
                  data: [
                    'CallOffFirstName CallOffLastName',
                    'Call off org Name',
                    'A01',
                    '',
                    'Calloff First Line',
                    'Calloff Second Line',
                    'Calloff Town',
                    'CO12 1AA',
                  ],
                  dataTestId: 'call-off-party',
                },
              },
              {
                multiLine: {
                  data: [
                    'SuppFirstName SuppLastName',
                    'Supplier Name',
                    '',
                    'Supplier First Line',
                    'Supplier Second Line',
                    'Supplier Town',
                    'SU12 1AA',
                  ],
                  dataTestId: 'supplier',
                },
              },
            ],
          ],
        },
      };

      const mockOrderDataWithCallOffAndSupplier = {
        ...mockOrderData,
        orderParty: {
          name: 'Call off org Name',
          odsCode: 'A01',
          address: {
            line1: 'Calloff First Line',
            line2: 'Calloff Second Line',
            town: 'Calloff Town',
            postcode: 'CO12 1AA',
          },
          primaryContact: {
            firstName: 'CallOffFirstName',
            lastName: 'CallOffLastName',
          },
        },
        supplier: {
          name: 'Supplier Name',
          address: {
            line1: 'Supplier First Line',
            line2: 'Supplier Second Line',
            town: 'Supplier Town',
            postcode: 'SU12 1AA',
          },
          primaryContact: {
            firstName: 'SuppFirstName',
            lastName: 'SuppLastName',
          },
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderDataWithCallOffAndSupplier });
      expect(context.callOffAndSupplierTable).toEqual(expectedContext.callOffAndSupplierTable);
    });

    it('should return the commencementDateLabel', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.commencementDateLabel).toEqual(incompleteManifest.commencementDateLabel);
    });

    it('should return the commencementDate', () => {
      const mockOrderDataWithCallOffAndSupplier = {
        ...mockOrderData,
        commencementDate: '2020-02-01T00:00:00',
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderDataWithCallOffAndSupplier });
      expect(context.commencementDate).toEqual('1 February 2020');
    });

    it('should return the oneOffCostHeading', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostHeading).toEqual(incompleteManifest.oneOffCostHeading);
    });

    it('should return the oneOffCostDescription', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostDescription).toEqual(incompleteManifest.oneOffCostDescription);
    });

    it('should return the recurringCostHeading', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.recurringCostHeading).toEqual(incompleteManifest.recurringCostHeading);
    });

    it('should return the recurringCostDescription', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.recurringCostDescription).toEqual(incompleteManifest.recurringCostDescription);
    });

    it('should return the oneOffCostTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTable.columnInfo)
        .toEqual(incompleteManifest.oneOffCostTable.columnInfo);
    });

    it('should return the oneOffCostTableFooter colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTableFooter.columnInfo)
        .toEqual(incompleteManifest.oneOffCostTableFooter.columnInfo);
    });

    it('should return the oneOff cost table with items when order items are provided', () => {
      const classes = 'nhsuk-u-font-size-14';
      const expectedContext = {
        oneOffCostTable: {
          ...incompleteManifest.oneOffCostTable,
          items: [
            [
              { classes, data: 'Some Recipient Name (A10001)', dataTestId: 'recipient-name' },
              { classes, data: 'item-1', dataTestId: 'item-id' },
              { classes, data: 'Some item name', dataTestId: 'item-name' },
              { classes, data: '585.00 per Day ', dataTestId: 'price-unit' },
              { classes, data: '70 ', dataTestId: 'quantity' },
              { classes: `${classes} nhsuk-table__cell--numeric`, data: '40,850.00', dataTestId: 'item-cost' },
            ],
          ],
        },
      };

      const mockOneOffCosts = [{
        catalogueItemType: 'AssociatedService',
        provisioningType: 'Declarative',
        cataloguePriceType: 'Flat',
        catalogueItemName: 'Some item name',
        price: 585.00,
        itemUnitDescription: 'per Day',
        costPerYear: 40850.00,
        serviceRecipients: [{
          name: 'Some Recipient Name',
          odsCode: 'A10001',
          itemId: 'item-1',
          quantity: 70,
        }],
      }];

      const contextData = {
        orderId: 'order-1',
        orderData: mockOrderData,
        oneOffCostItems: mockOneOffCosts,
      };

      const context = getContext(contextData);
      expect(context.oneOffCostTable).toEqual(expectedContext.oneOffCostTable);
    });

    it('should return an empty recurring cost table when no order items are provided', () => {
      const expectedContext = {
        oneOffCostTable: {
          ...incompleteManifest.oneOffCostTable,
          items: [],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: {} });
      expect(context.oneOffCostTable).toEqual(expectedContext.oneOffCostTable);
    });

    it('should return the oneOffCostTableFooter with items and the total cost value set to 0.00 when not provided', () => {
      const expectedContext = {
        oneOffCostTableFooter: {
          ...incompleteManifest.oneOffCostTableFooter,
          items: [
            [
              {
                data: incompleteManifest.oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.data,
                classes: incompleteManifest
                  .oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.classes,
                dataTestId: 'total-cost-label',
              },
              {
                data: '0.00',
                classes: incompleteManifest
                  .oneOffCostTableFooter.cellInfo.totalOneOffCostValue.classes,
                dataTestId: 'total-cost-value',
              },
            ],
          ],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTableFooter).toEqual(expectedContext.oneOffCostTableFooter);
    });

    it('should return the oneOffCostTableFooter with items and the total cost value when provided', () => {
      const expectedContext = {
        oneOffCostTableFooter: {
          ...incompleteManifest.oneOffCostTableFooter,
          items: [
            [
              {
                data: incompleteManifest.oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.data,
                classes: incompleteManifest
                  .oneOffCostTableFooter.cellInfo.totalOneOffCostLabel.classes,
                dataTestId: 'total-cost-label',
              },
              {
                data: '1,981.02',
                classes: incompleteManifest
                  .oneOffCostTableFooter.cellInfo.totalOneOffCostValue.classes,
                dataTestId: 'total-cost-value',
              },
            ],
          ],
        },
      };

      const mockDataWithTotalOneOffCost = {
        ...mockOrderData,
        totalOneOffCost: 1981.020,
      };

      const context = getContext({ orderId: 'order-1', orderData: mockDataWithTotalOneOffCost });
      expect(context.oneOffCostTableFooter).toEqual(expectedContext.oneOffCostTableFooter);
    });

    it('should return the recurringCostTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTable.columnInfo)
        .toEqual(incompleteManifest.oneOffCostTable.columnInfo);
    });

    it('should return the recurring cost table with items when order items are provided', () => {
      const classes = 'nhsuk-u-font-size-14';
      const expectedContext = {
        recurringCostTable: {
          ...incompleteManifest.recurringCostTable,
          items: [
            [
              { classes, data: 'Some Recipient Name (A10001)', dataTestId: 'recipient-name' },
              { classes, data: 'item-1', dataTestId: 'item-id' },
              { classes, data: 'Some item name', dataTestId: 'item-name' },
              { classes, data: 'service-instance-id', dataTestId: 'service-instance-id' },
              { classes, data: '1.26 per patient per year', dataTestId: 'price-unit' },
              { classes, data: '85 per month', dataTestId: 'quantity' },
              { classes, data: '24 February 2020', dataTestId: 'planned-date' },
              { classes: `${classes} nhsuk-table__cell--numeric`, data: '5,000.00', dataTestId: 'item-cost' },
            ],
          ],
        },
      };

      const mockRecurringCosts = [{
        catalogueItemType: 'Solution',
        provisioningType: 'Declarative',
        cataloguePriceType: 'Flat',
        catalogueItemName: 'Some item name',
        price: 1.260,
        itemUnitDescription: 'per patient',
        timeUnitDescription: 'per year',
        quantityPeriodDescription: 'per month',
        costPerYear: 5000.000,
        serviceRecipients: [
          {
            itemId: 'item-1',
            deliveryDate: '2020-02-24',
            name: 'Some Recipient Name',
            odsCode: 'A10001',
            quantity: 85,
            serviceInstanceId: 'service-instance-id',
          },
        ],
      }];

      const contextData = {
        orderId: 'order-1',
        orderData: mockOrderData,
        recurringCostItems: mockRecurringCosts,
      };

      const context = getContext(contextData);
      expect(context.recurringCostTable).toEqual(expectedContext.recurringCostTable);
    });

    it('should return an empty recurring cost table when no order items are provided', () => {
      const expectedContext = {
        recurringCostTable: {
          ...incompleteManifest.recurringCostTable,
          items: [],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: {} });
      expect(context.recurringCostTable).toEqual(expectedContext.recurringCostTable);
    });

    it('should throw an error when a service recipient cannot be found', () => {
      const mockRecurringCosts = [{
      }];

      const contextData = {
        orderId: 'order-1',
        orderData: mockOrderData,
        recurringCostItems: mockRecurringCosts,
        serviceRecipients: {},
      };

      expect(() => getContext(contextData)).toThrow(Error);
    });

    it('should return the recurringCostTableFooter with items and the total costs set to 0.00 when not provided', () => {
      const expectedContext = {
        recurringCostTableFooter: {
          ...incompleteManifest.recurringCostTableFooter,
          items: [
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOneYearCostLabel.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOneYearCostLabel.classes,
                dataTestId: 'total-year-cost-label',
                hideSeperator: true,
              },
              {
                data: '0.00',
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOneYearCostValue.classes,
                dataTestId: 'total-year-cost-value',
                hideSeperator: true,
              },
            ],
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.classes,
                dataTestId: 'total-monthly-cost-label',
              },
              {
                data: '0.00',
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalMonthlyCostValue.classes,
                dataTestId: 'total-monthly-cost-value',
              },
            ],
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.classes,
                dataTestId: 'total-ownership-cost-label',
                hideSeperator: true,
              },
              {
                data: '0.00',
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipCostValue.classes,
                dataTestId: 'total-ownership-cost-value',
                hideSeperator: true,
              },
            ],
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipTerms.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipTerms.classes,
                dataTestId: 'total-ownership-terms',
                hideSeperator: true,
              },
              {
                data: '',
                dataTestId: 'blank-cell',
                hideSeperator: true,
              },
            ],
          ],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });

      expect(context.recurringCostTableFooter).toEqual(expectedContext.recurringCostTableFooter);
    });

    it('should return the recurringCostTableFooter with items and the total cost value when provided', () => {
      const expectedContext = {
        recurringCostTableFooter: {
          ...incompleteManifest.recurringCostTableFooter,
          items: [
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOneYearCostLabel.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOneYearCostLabel.classes,
                dataTestId: 'total-year-cost-label',
                hideSeperator: true,
              },
              {
                data: '1,981.03',
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOneYearCostValue.classes,
                dataTestId: 'total-year-cost-value',
                hideSeperator: true,
              },
            ],
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalMonthlyCostLabel.classes,
                dataTestId: 'total-monthly-cost-label',
              },
              {
                data: '191.00',
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalMonthlyCostValue.classes,
                dataTestId: 'total-monthly-cost-value',
              },
            ],
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipCostLabel.classes,
                dataTestId: 'total-ownership-cost-label',
                hideSeperator: true,
              },
              {
                data: '2,345.40',
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipCostValue.classes,
                dataTestId: 'total-ownership-cost-value',
                hideSeperator: true,
              },
            ],
            [
              {
                data: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipTerms.data,
                classes: incompleteManifest
                  .recurringCostTableFooter.cellInfo.totalOwnershipTerms.classes,
                dataTestId: 'total-ownership-terms',
                hideSeperator: true,
              },
              {
                data: '',
                dataTestId: 'blank-cell',
                hideSeperator: true,
              },
            ],
          ],
        },
      };

      const mockDataWithTotalRecurringCosts = {
        ...mockOrderData,
        totalRecurringCostPerYear: 1981.02899999,
        totalRecurringCostPerMonth: 191.00001,
        totalOwnershipCost: 2345.40009999,
      };

      const context = getContext({ orderId: 'order-1', orderData: mockDataWithTotalRecurringCosts });
      expect(context.recurringCostTableFooter).toEqual(expectedContext.recurringCostTableFooter);
    });
  });
});
