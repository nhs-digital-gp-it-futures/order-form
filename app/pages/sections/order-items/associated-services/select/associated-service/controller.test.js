import {
  getAssociatedServicePageContext,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('associated-services select-associated-service controller', () => {
  describe('getAssociatedServicePageContext', () => {
    it('should call getContext with the correct params', () => {
      contextCreator.getContext.mockResolvedValueOnce();

      getAssociatedServicePageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });
});
