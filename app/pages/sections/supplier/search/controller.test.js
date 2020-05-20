import * as contextCreator from './contextCreator';
import { getSupplierSearchPageContext } from './controller';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('supplier search controller', () => {
  describe('getSupplierSearchPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSupplierSearchPageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });
});
