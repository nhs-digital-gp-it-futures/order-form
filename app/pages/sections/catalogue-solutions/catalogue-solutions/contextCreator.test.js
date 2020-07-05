import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

describe('catalogue-solutions contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
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
                href: '/order/organisation/order-1/catalogue-solutions/orderItem1',
                dataTestId: 'orderItem1-solutionName',
              },
              {
                data: 'Recipient One (recipient-1)',
                dataTestId: 'orderItem1-serviceRecipient',
              },
            ],
            [
              {
                data: 'Solution One',
                href: '/order/organisation/order-1/catalogue-solutions/orderItem2',
                dataTestId: 'orderItem2-solutionName',
              },
              {
                data: 'Recipient Two (recipient-2)',
                dataTestId: 'orderItem2-serviceRecipient',
              },
            ],
          ],
        },
      };

      const mockOrderItems = [
        {
          orderItemId: 'orderItem1',
          solutionName: 'Solution One',
          serviceRecipient: {
            name: 'Recipient One',
            odsCode: 'recipient-1',
          },
        },
        {
          orderItemId: 'orderItem2',
          solutionName: 'Solution One',
          serviceRecipient: {
            name: 'Recipient Two',
            odsCode: 'recipient-2',
          },
        },
      ];
      const context = getContext({ orderId: 'order-1', orderItems: mockOrderItems });
      expect(context.addedOrderItemsTable).toEqual(expectedContext.addedOrderItemsTable);
    });

    it('should return the addOrderItemButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addOrderItemButtonText).toEqual(manifest.addOrderItemButtonText);
    });

    it('should return the addSolutionButtonHref', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addOrderItemButtonHref).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/select/solution`);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
