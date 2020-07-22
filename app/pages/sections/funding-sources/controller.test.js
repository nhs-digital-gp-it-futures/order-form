import { getFundingSourcesContext } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('Funding Sources controller', () => {
  describe('getFundingSourcesContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getContext with the correct params for an order with an id', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getFundingSourcesContext({ orderId: 'order-id' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id' });
    });
  });
});
