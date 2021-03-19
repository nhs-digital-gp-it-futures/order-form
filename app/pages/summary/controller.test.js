import { getSummaryPageContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('order summary controller', () => {
  describe('getSummaryPageContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
    });

    it('should call getContext with the correct params', () => {
      const fakeOneOffCostItem = { catalogueItemType: 'AssociatedService', provisioningType: 'Declarative' };
      const fakeRecurringCostItem = { catalogueItemType: 'AdditionalService', provisioningType: 'Declarative' };
      const orderId = 'order-1';
      const orderItems = [fakeRecurringCostItem, fakeOneOffCostItem];
      const orderData = { description: 'fake order', orderItems };

      contextCreator.getContext.mockResolvedValueOnce();

      const expectedParams = {
        orderId,
        orderData,
        oneOffCostItems: [fakeOneOffCostItem],
        recurringCostItems: [fakeRecurringCostItem],
      };

      getSummaryPageContext({
        orderId,
        orderData,
        oneOffCostItems: [fakeOneOffCostItem],
        recurringCostItems: [fakeRecurringCostItem],
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(expectedParams);
    });
  });
});
