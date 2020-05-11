import { getNewOrderPageContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('order-task-list controller', () => {
  describe('getNewOrderPageContext', () => {
    it('should call getContext with the correct params when user data is returned by the apiProvider', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getNewOrderPageContext();

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ pageName: 'neworder' });
    });
  });
});
