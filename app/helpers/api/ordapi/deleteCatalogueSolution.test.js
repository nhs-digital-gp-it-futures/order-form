import { deleteData } from 'buying-catalogue-library';
import { deleteCatalogueSolution } from './deleteCatalogueSolution';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('deleteCatalogueSolution', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      deleteData.mockRejectedValueOnce({ response: { status: 404 } });

      try {
        await deleteCatalogueSolution({
          orderId: 'order1',
          orderItemId: 'orderItemId1',
          accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual({ response: { status: 404 } });
      }
    });
  });

  describe('with no errors', () => {
    it('should call deleteData with the expected parameters', async () => {
      deleteData.mockResolvedValueOnce();

      await deleteCatalogueSolution({
        orderId: 'order1',
        orderItemId: 'order-Item-Id-1',
        accessToken: 'access_token',
      });

      expect(deleteData.mock.calls.length).toEqual(1);
      expect(deleteData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/order-items/order-Item-Id-1`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if deleted successfully', async () => {
      deleteData.mockResolvedValueOnce({ response: { status: 204 } });

      const response = await deleteCatalogueSolution({
        orderId: 'order1',
        orderItemId: 'order-Item-Id-1',
        accessToken: 'access_token',
      });

      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
