import { fakeSessionManager } from 'buying-catalogue-library';
import { getOrderDescription } from './getOrderDescription';
import { logger } from '../../logger';
import { getOrderDescription as getOrderDescriptionFromApi } from '../api/ordapi/getOrderDescription';

jest.mock('../../logger');
jest.mock('../api/ordapi/getOrderDescription', () => ({
  getOrderDescription: jest.fn(),
}));

describe('order helper', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getOrderDescription', () => {
    it('should call getOrderDescription (ORDAPI) with the correct params when the order description is not in session', async () => {
      fakeSessionManager.getFromSession = () => undefined;
      fakeSessionManager.saveToSession = () => {};

      getOrderDescriptionFromApi.mockResolvedValueOnce({ description: 'A description' });

      const orderId = 'order-1';
      const req = { params: { orderId } };
      const accessToken = 'access-token';

      await getOrderDescription({
        req,
        sessionManager: fakeSessionManager,
        accessToken,
        logger,
      });

      expect(getOrderDescriptionFromApi.mock.calls.length).toEqual(1);
      expect(getOrderDescriptionFromApi).toHaveBeenCalledWith({ orderId, accessToken, logger });
    });

    it('should not call getOrderDescription (ORDAPI) when the order description is in session', async () => {
      fakeSessionManager.getFromSession = () => 'Some description';
      fakeSessionManager.saveToSession = () => {};

      getOrderDescriptionFromApi.mockResolvedValueOnce();

      await getOrderDescription({
        req: { params: { orderId: 'order-1' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(getOrderDescriptionFromApi.mock.calls.length).toEqual(0);
    });

    it('should return the expected result', async () => {
      const description = 'Order description';

      fakeSessionManager.getFromSession = () => description;
      fakeSessionManager.saveToSession = () => {};

      getOrderDescriptionFromApi.mockResolvedValueOnce({ description });

      const actualResult = await getOrderDescription({
        req: { params: { orderId: 'order-1' } },
        sessionManager: fakeSessionManager,
        accessToken: 'access-token',
        logger,
      });

      expect(actualResult).toEqual(description);
    });
  });
});
