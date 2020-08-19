import { fakeSessionManager } from 'buying-catalogue-library';
import { getDeleteOrderContext, deleteOrder } from './controller';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';
import { deleteOrder as apiDeleteOrder } from '../../helpers/api/ordapi/deleteOrder';
import { logger } from '../../logger';
import * as contextCreator from './contextCreator';

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../helpers/routes/getOrderDescription');
jest.mock('../../helpers/api/ordapi/deleteOrder');
jest.mock('../../logger');

describe('Delete Order controller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getDeleteOrderContext', () => {
    it('should call getContext with the correct params', async () => {
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

    it('should call getOrderDescription with the correct params', async () => {
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

    it('should return the expected result', async () => {
      const expectedContext = { context: 'contextData' };

      contextCreator.getContext.mockResolvedValueOnce(expectedContext);
      getOrderDescription.mockResolvedValueOnce('');

      const actualContext = await getDeleteOrderContext({
        req: { params: { orderId: 'order-id' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(actualContext).toEqual(expectedContext);
    });
  });

  describe('deleteOrder', () => {
    it('should call deleteOrder with the correct params', async () => {
      apiDeleteOrder.mockResolvedValueOnce();

      const orderId = 'order-id';
      const accessToken = 'access-token';

      await deleteOrder({ orderId, accessToken });

      expect(apiDeleteOrder.mock.calls.length).toEqual(1);
      expect(apiDeleteOrder).toHaveBeenCalledWith({ orderId, accessToken });
    });
  });
});
