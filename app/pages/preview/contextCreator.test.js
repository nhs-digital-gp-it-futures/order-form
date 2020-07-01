import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order summary preview contextCreator', () => {
  describe('getContext', () => {
    const mockOrderData = { description: 'Some order description' };

    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, orderData: mockOrderData });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.orderDescriptionHeading).toEqual(manifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the dateSummaryCreatedLabel', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.dateSummaryCreatedLabel).toEqual(manifest.dateSummaryCreatedLabel);
    });

    it('should return the dateSummaryCreated as the current date', () => {
      Date.now = jest.fn().mockReturnValue('2020-07-19T13:41:38.838Z');
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.dateSummaryCreated).toEqual('19 July 2020');
    });

    it('should return the callOffAndSupplierTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.callOffAndSupplierTable.columnInfo)
        .toEqual(manifest.callOffAndSupplierTable.columnInfo);
    });

    it('should return the callOffAndSupplierTable without items if orderData is empty', () => {
      const context = getContext({ orderId: 'order-1', orderData: {} });
      expect(context.callOffAndSupplierTable.items).toEqual([[]]);
    });

    it('should return the callOffAndSupplierTable with items when order items are provided', () => {
      const expectedContext = {
        callOffAndSupplierTable: {
          ...manifest.callOffAndSupplierTable,
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
      expect(context.commencementDateLabel).toEqual(manifest.commencementDateLabel);
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
      expect(context.oneOffCostHeading).toEqual(manifest.oneOffCostHeading);
    });

    it('should return the oneOffCostDescription', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostDescription).toEqual(manifest.oneOffCostDescription);
    });

    it('should return the recurringCostHeading', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.recurringCostHeading).toEqual(manifest.recurringCostHeading);
    });

    it('should return the recurringCostDescription', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.recurringCostDescription).toEqual(manifest.recurringCostDescription);
    });

    it('should return the oneOffCostTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTable.columnInfo)
        .toEqual(manifest.oneOffCostTable.columnInfo);
    });

    it('should return the oneOffCostTotalsTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTotalsTable.columnInfo)
        .toEqual(manifest.oneOffCostTotalsTable.columnInfo);
    });

    it('should return the oneOffCostTotalsTable with items and the total cost value set to 0.00 when not provided', () => {
      const expectedContext = {
        oneOffCostTotalsTable: {
          ...manifest.oneOffCostTotalsTable,
          items: [
            [
              {
                data: manifest.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.data,
                classes: manifest.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.classes,
                dataTestId: 'total-cost-label',
              },
              {
                data: '0.00',
                classes: manifest.oneOffCostTotalsTable.cellInfo.totalOneOffCostValue.classes,
                dataTestId: 'total-cost-value',
              },
            ],
          ],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTotalsTable).toEqual(expectedContext.oneOffCostTotalsTable);
    });

    it('should return the oneOffCostTotalsTable with items and the total cost value set to when provided', () => {
      const expectedContext = {
        oneOffCostTotalsTable: {
          ...manifest.oneOffCostTotalsTable,
          items: [
            [
              {
                data: manifest.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.data,
                classes: manifest.oneOffCostTotalsTable.cellInfo.totalOneOffCostLabel.classes,
                dataTestId: 'total-cost-label',
              },
              {
                data: '1,981.02',
                classes: manifest.oneOffCostTotalsTable.cellInfo.totalOneOffCostValue.classes,
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
      expect(context.oneOffCostTotalsTable).toEqual(expectedContext.oneOffCostTotalsTable);
    });

    it('should return the recurringCostTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTable.columnInfo)
        .toEqual(manifest.oneOffCostTable.columnInfo);
    });

    it('should return the recurringCostTotalsTable with items and the total costs set to 0.00 when not provided', () => {
      const expectedContext = {
        recurringCostTotalsTable: {
          ...manifest.recurringCostTotalsTable,
          items: [
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.classes,
                dataTestId: 'total-year-cost-label',
              },
              {
                data: '0.00',
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOneYearCostValue.classes,
                dataTestId: 'total-year-cost-value',
              },
            ],
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.classes,
                dataTestId: 'total-monthly-cost-label',
              },
              {
                data: '0.00',
                classes: manifest.recurringCostTotalsTable.cellInfo.totalMonthlyCostValue.classes,
                dataTestId: 'total-monthly-cost-value',
              },
            ],
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.classes,
                dataTestId: 'total-ownership-cost-label',
              },
              {
                data: '0.00',
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipCostValue.classes,
                dataTestId: 'total-ownership-cost-value',
              },
            ],
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.classes,
                dataTestId: 'total-ownership-terms',
              },
              {
                data: '',
                dataTestId: 'blank-cell',
              },
            ],
          ],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });

      expect(context.recurringCostTotalsTable).toEqual(expectedContext.recurringCostTotalsTable);
    });

    it('should return the recurringCostTotalsTable with items and the total cost value set to when provided', () => {
      const expectedContext = {
        recurringCostTotalsTable: {
          ...manifest.recurringCostTotalsTable,
          items: [
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOneYearCostLabel.classes,
                dataTestId: 'total-year-cost-label',
              },
              {
                data: '1,981.02',
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOneYearCostValue.classes,
                dataTestId: 'total-year-cost-value',
              },
            ],
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalMonthlyCostLabel.classes,
                dataTestId: 'total-monthly-cost-label',
              },
              {
                data: '191.69',
                classes: manifest.recurringCostTotalsTable.cellInfo.totalMonthlyCostValue.classes,
                dataTestId: 'total-monthly-cost-value',
              },
            ],
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipCostLabel.classes,
                dataTestId: 'total-ownership-cost-label',
              },
              {
                data: '2,345.43',
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipCostValue.classes,
                dataTestId: 'total-ownership-cost-value',
              },
            ],
            [
              {
                data: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.data,
                classes: manifest.recurringCostTotalsTable.cellInfo.totalOwnershipTerms.classes,
                dataTestId: 'total-ownership-terms',
              },
              {
                data: '',
                dataTestId: 'blank-cell',
              },
            ],
          ],
        },
      };

      const mockDataWithTotalRecurringCosts = {
        ...mockOrderData,
        totalRecurringCostPerYear: 1981.028,
        totalRecurringCostPerMonth: 191.691,
        totalOwnershipCost: 2345.430,
      };

      const context = getContext({ orderId: 'order-1', orderData: mockDataWithTotalRecurringCosts });
      expect(context.recurringCostTotalsTable).toEqual(expectedContext.recurringCostTotalsTable);
    });
  });
});
