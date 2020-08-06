import { fakeSessionManager } from 'buying-catalogue-library';
import { getDeleteOrderContext } from './controller';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';
import { logger } from '../../logger';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../helpers/routes/getOrderDescription');
jest.mock('../../logger');

describe('Delete Order controller', () => {
  describe('getDeleteOrderContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getContext with the correct params for an order with an id', async () => {
      const orderDescription = 'some-order-description';

      contextCreator.getContext.mockResolvedValueOnce();
      getOrderDescription.mockResolvedValueOnce(orderDescription);

      const orderId = 'order-id';
      const accessToken = 'access-token';

      await getDeleteOrderContext({
        req: { params: { orderId } },
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription });
    });

    it('should call getOrderDescription with the correct params for an order with an id', async () => {
      contextCreator.getContext.mockResolvedValueOnce();
      getOrderDescription.mockResolvedValueOnce('');

      const accessToken = 'access-token';
      const req = { params: { orderId: 'order-id' } };

      await getDeleteOrderContext({
        req,
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        req,
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });
    });
  });
});
