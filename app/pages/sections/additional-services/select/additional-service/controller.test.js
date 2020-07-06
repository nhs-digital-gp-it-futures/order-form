import {
  getAdditionalServicePageContext,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('additional-services select-additional-service controller', () => {
  describe('getAdditionalServicePageContext', () => {
    it('should call getContext with the correct params', () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      getAdditionalServicePageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });
});
