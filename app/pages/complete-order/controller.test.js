import { getCompleteOrderContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Complete Order controller', () => {
  describe('getCompleteOrderContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getContext with the correct params for an order with an id', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getCompleteOrderContext({ orderId: 'order-id', orderDescription: 'some-order-description', fundingSource: true });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', orderDescription: 'some-order-description', fundingSource: true });
    });
  });
});
