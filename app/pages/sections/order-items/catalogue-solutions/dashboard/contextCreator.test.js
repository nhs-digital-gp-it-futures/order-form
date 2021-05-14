import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../../config';

describe('catalogue-solutions contextCreator', () => {
  const odsCode = '03F';
  const orderId = 'order-1';
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the insetAdvice', () => {
      const context = getContext({ orderId });
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId });
      expect(context.orderDescriptionHeading).toEqual(manifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId, orderDescription: 'Some order description' });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the noSolutionsText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.noSolutionsText).toEqual(manifest.noSolutionsText);
    });

    it('should return the addedOrderItemsTable colummInfo and columnClass', () => {
      const context = getContext({ orderId: 'order-1', orderItems: [] });
      expect(context.addedOrderItemsTable.columnInfo)
        .toEqual(manifest.addedOrderItemsTable.columnInfo);
      expect(context.addedOrderItemsTable.columnClass)
        .toEqual(manifest.addedOrderItemsTable.columnClass);
    });

    it('should return the addedOrderItemsTable without items if no order items are provided', () => {
      const context = getContext({ orderId: 'order-1', orderItems: [] });
      expect(context.addedOrderItemsTable.items).toEqual([]);
    });

    it('should return the addedOrderItemsTable with items when order items are provided', () => {
      const expectedContext = {
        addedOrderItemsTable: {
          ...manifest.addedOrderItemsTable,
          items: [
            [
              {
                data: 'Solution One',
                href: '/order/organisation/03F/order/order-1/catalogue-solutions/orderItem1',
                dataTestId: 'orderItem1-catalogueItemName',
              },
              {
                data: 'per patient per year',
                dataTestId: 'orderItem1-unitOfOrder',
              },
              {
                expandableSection: {
                  dataTestId: 'orderItem1-serviceRecipients',
                  title: 'Service recipients (ODS code)',
                  innerComponent: 'Recipient One (recipient-1)<br><br>Recipient Two (recipient-2)',
                },
              },
            ],
            [
              {
                data: 'Solution Two',
                href: '/order/organisation/03F/order/order-1/catalogue-solutions/orderItem3',
                dataTestId: 'orderItem3-catalogueItemName',
              },
              {
                data: 'per patient per year',
                dataTestId: 'orderItem3-unitOfOrder',
              },
              {
                expandableSection: {
                  dataTestId: 'orderItem3-serviceRecipients',
                  title: 'Service recipients (ODS code)',
                  innerComponent: 'Recipient Three (recipient-3)',
                },
              },
            ],
          ],
        },
      };

      const mockOrderItems = [
        {
          catalogueItemName: 'Solution One',
          catalogueItemId: 'orderItem1',
          serviceRecipients: [{
            name: 'Recipient One',
            odsCode: 'recipient-1',
          },
          {
            name: 'Recipient Two',
            odsCode: 'recipient-2',
          }],
          itemUnit: {
            name: 'patient',
            description: 'per patient',
          },
          timeUnit: {
            name: 'year',
            description: 'per year',
          },
        },
        {
          orderItemId: 'orderItem3',
          catalogueItemName: 'Solution Two',
          catalogueItemId: 'orderItem3',
          serviceRecipients: [{
            name: 'Recipient Three',
            odsCode: 'recipient-3',
          }],
          itemUnit: {
            name: 'patient',
            description: 'per patient',
          },
          timeUnit: {
            name: 'year',
            description: 'per year',
          },
        },
      ];
      const context = getContext({ orderId: 'order-1', orderItems: mockOrderItems, odsCode });
      expect(context.addedOrderItemsTable).toEqual(expectedContext.addedOrderItemsTable);
    });

    it('should return the addedOrderItemsTable with items when orderitem in onDemand type', () => {
      const expectedContext = {
        addedOrderItemsTable: {
          ...manifest.addedOrderItemsTable,
          items: [
            [
              {
                data: 'Solution One',
                href: '/order/organisation/03F/order/order-1/catalogue-solutions/orderItem1',
                dataTestId: 'orderItem1-catalogueItemName',
              },
              {
                data: 'per active user',
                dataTestId: 'orderItem1-unitOfOrder',
              },
              {
                expandableSection: {
                  dataTestId: 'orderItem1-serviceRecipients',
                  title: 'Service recipients (ODS code)',
                  innerComponent: 'Recipient One (recipient-1)<br><br>Recipient Two (recipient-2)',
                },
              },
            ],
          ],
        },
      };

      const mockOrderItems = [{
        catalogueItemName: 'Solution One',
        catalogueItemId: 'orderItem1',
        provisioningType: 'OnDemand',
        serviceRecipients: [{
          name: 'Recipient One',
          odsCode: 'recipient-1',
        },
        {
          name: 'Recipient Two',
          odsCode: 'recipient-2',
        }],
        itemUnit: {
          name: 'activeUser',
          description: 'per active user',
        },
        timeUnit: {
          name: 'year',
          description: 'per year',
        },
      }];
      const context = getContext({ orderId: 'order-1', orderItems: mockOrderItems, odsCode });
      expect(context.addedOrderItemsTable).toEqual(expectedContext.addedOrderItemsTable);
    });

    it('should return the addOrderItemButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addOrderItemButtonText).toEqual(manifest.addOrderItemButtonText);
    });

    it('should return the addOrderItemButtonHref', () => {
      const context = getContext({ orderId: 'order-1', odsCode });
      expect(context.addOrderItemButtonHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/order-1/catalogue-solutions/select/solution`);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
