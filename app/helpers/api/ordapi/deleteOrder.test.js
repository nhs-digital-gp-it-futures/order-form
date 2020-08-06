import { deleteData } from 'buying-catalogue-library';
import { deleteOrder } from './deleteOrder';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('deleteOrder', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      deleteData.mockRejectedValueOnce({ response: { status: 404 } });

      try {
        await deleteOrder({
          orderId: 'order1',
          accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual({ response: { status: 404 } });
      }
    });
  });

  describe('with no errors', () => {
    it('should call deleteData with the expected parameters', async () => {
      deleteData.mockResolvedValueOnce({ response: { status: 204 } });

      await deleteOrder({
        orderId: 'order1',
        accessToken: 'access_token',
        fundingSource: 'true',
      });

      expect(deleteData.mock.calls.length).toEqual(1);
      expect(deleteData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if deleted successfully', async () => {
      deleteData.mockResolvedValueOnce({ response: { status: 204 } });

      const response = await deleteOrder({
        orderId: 'order1',
        accessToken: 'access_token',
      });

      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
