import { getPreviewPageContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('order summary preview controller', () => {
  describe('getPreviewPageContext', () => {
    afterEach(() => {
      contextCreator.getContext.mockReset();
    });

    it('should call getContext with the correct params', () => {
      const fakeOneOffCostItem = { catalogueItemType: 'AssociatedService', provisioningType: 'Declarative' };
      const fakeRecurringCostItem = { catalogueItemType: 'AdditionalService', provisioningType: 'Declarative' };
      const orderId = 'order-1';
      const orderItems = [fakeRecurringCostItem, fakeOneOffCostItem];
      const serviceRecipients = { fakeRecipient: { odsCode: 'fakeRecipient' } };
      const orderData = { description: 'fake order', orderItems, serviceRecipients };

      contextCreator.getContext.mockResolvedValueOnce();

      const expectedParams = {
        orderId,
        orderData,
        oneOffCostItems: [fakeOneOffCostItem],
        recurringCostItems: [fakeRecurringCostItem],
        serviceRecipients,
      };

      getPreviewPageContext({
        orderId,
        orderData,
        oneOffCostItems: [fakeOneOffCostItem],
        recurringCostItems: [fakeRecurringCostItem],
        serviceRecipients,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(expectedParams);
    });
  });
});
