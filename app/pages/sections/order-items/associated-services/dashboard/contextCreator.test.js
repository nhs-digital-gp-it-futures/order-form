import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../../config';

describe('associated-services contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const odsCode = '03F';
      const context = getContext({ orderId, odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the insetAdvice', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.orderDescriptionHeading).toEqual(manifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId: 'order-1', orderDescription: 'Some order description' });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the noOrderItemsText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.noOrderItemsText).toEqual(manifest.noOrderItemsText);
    });

    it('should return the addOrderItemButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addOrderItemButtonText).toEqual(manifest.addOrderItemButtonText);
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
                data: 'Additional Service One',
                href: '/order/organisation/03F/order/order-1/associated-services/orderItem1',
                dataTestId: 'orderItem1-catalogueItemName',
              },
              {
                data: 'per patient per month',
                dataTestId: 'orderItem1-unitoforder',
              },
            ],
            [
              {
                data: 'Additional Service Two',
                href: '/order/organisation/03F/order/order-1/associated-services/orderItem2',
                dataTestId: 'orderItem2-catalogueItemName',
              },
              {
                data: 'per appointment',
                dataTestId: 'orderItem2-unitoforder',
              },
            ],
          ],
        },
      };

      const mockOrderItems = [
        {
          catalogueItemId: 'orderItem1',
          catalogueItemName: 'Additional Service One',
          itemUnit: {
            name: 'patient',
            description: 'per patient',
          },
          timeUnit: {
            name: 'month',
            description: 'per month',
          },
        },
        {
          catalogueItemId: 'orderItem2',
          catalogueItemName: 'Additional Service Two',
          itemUnit: {
            name: 'appointment',
            description: 'per appointment',
          },
        },
      ];
      const context = getContext({ orderId: 'order-1', orderItems: mockOrderItems, odsCode: '03F' });
      expect(context.addedOrderItemsTable).toEqual(expectedContext.addedOrderItemsTable);
    });

    it('should return the addOrderItemButtonHref', () => {
      const odsCode = '03F';
      const context = getContext({ orderId: 'order-1', odsCode });
      expect(context.addOrderItemButtonHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/order-1/associated-services/select/associated-service`);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
