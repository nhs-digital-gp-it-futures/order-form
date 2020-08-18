import { getOrderConfirmationContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Order confirmation controller', () => {
  describe('getCompleteOrderContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getContext with the correct params for an order with an id', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getOrderConfirmationContext({ orderId: 'order-id', fundingSource: true });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', fundingSource: true });
    });
  });
});
