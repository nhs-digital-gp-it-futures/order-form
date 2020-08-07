import { putData } from 'buying-catalogue-library';
import { putOrderStatus } from './putOrderStatus';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('putOrderStatus', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      const responseData = { errors: [{}] };
      putData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      try {
        await putOrderStatus({
          orderId: 'order1',
          accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual({ response: { data: { errors: [{}] }, status: 400 } });
      }
    });
  });

  describe('with no errors', () => {
    it('should post correctly formatted data', async () => {
      putData.mockResolvedValueOnce({ data: { status: 'complete' } });

      await putOrderStatus({
        orderId: 'order1',
        accessToken: 'access_token',
      });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/status`,
        body: {
          status: 'Complete',
        },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if data is saved successfully', async () => {
      const response = await putOrderStatus({
        orderId: 'order1',
        accessToken: 'access_token',
      });

      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
