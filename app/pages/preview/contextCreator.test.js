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

    it('should return the callOffAndSupplierTable colummInfo and columnClass', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.callOffAndSupplierTable.columnInfo)
        .toEqual(manifest.callOffAndSupplierTable.columnInfo);
      expect(context.callOffAndSupplierTable.columnClass)
        .toEqual(manifest.callOffAndSupplierTable.columnClass);
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

    it('should return the recurringCostTable colummInfo', () => {
      const context = getContext({ orderId: 'order-1', orderData: mockOrderData });
      expect(context.oneOffCostTable.columnInfo)
        .toEqual(manifest.oneOffCostTable.columnInfo);
    });

    it('should return the recurring cost table with items when order items are provided', () => {
      const expectedContext = {
        recurringCostTable: {
          ...manifest.recurringCostTable,
          items: [
            [
              { data: 'Some Recipient Name', dataTestId: 'recipient-name' },
              { data: 'item-1', dataTestId: 'item-id' },
              { data: 'Some item name', dataTestId: 'item-name' },
              { data: '£1.26 per patient per year', dataTestId: 'price-unit' },
              { data: '500 per month', dataTestId: 'quantity' },
              { data: '24 February 2020', dataTestId: 'planned-date' },
              { data: '5000', dataTestId: 'item-cost' },
            ],
          ],
        },
      };

      const mockRecurringCosts = [{
        catalogueItemType: 'Solution',
        itemId: 'item-1',
        provisioningType: 'Declarative',
        serviceRecipientsOdsCode: 'A10001',
        cataloguePriceType: 'Flat',
        catalogueItemName: 'Some item name',
        price: 1.260,
        itemUnitDescription: 'per patient',
        timeUnitDescription: 'per year',
        quantity: 500,
        quantityPeriodDescription: 'per month',
        deliveryDate: '2020-02-24',
        costPerYear: 5000.000,
      }];

      const mockOrderDataWithServiceRecipients = {
        ...mockOrderData,
        serviceRecipients: [
          {
            name: 'Some Recipient Name',
            odsCode: 'A10001',
          },
        ],
      };

      const context = getContext({ orderId: 'order-1', orderData: mockOrderDataWithServiceRecipients, recurringCostItems: mockRecurringCosts });
      expect(context.recurringCostTable).toEqual(expectedContext.recurringCostTable);
    });

    it('should return an empty recurring cost table when no order items are provided', () => {
      const expectedContext = {
        recurringCostTable: {
          ...manifest.recurringCostTable,
          items: [],
        },
      };

      const context = getContext({ orderId: 'order-1', orderData: {} });
      expect(context.recurringCostTable).toEqual(expectedContext.recurringCostTable);
    });
  });
});
