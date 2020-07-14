import {
  getAdditionalServiceRecipientPageContext,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Additional-services select-recipient controller', () => {
  describe('getRecipientPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getAdditionalServiceRecipientPageContext({ orderId: 'order-1', itemName: 'Item name' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', itemName: 'Item name' });
    });
  });
});
