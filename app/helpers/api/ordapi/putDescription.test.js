import { putData } from 'buying-catalogue-library';
import { putDescription } from './putDescription';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('putDescription', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const formData = {
    description: 'some description',
  };

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      const responseData = { errors: [{}] };
      putData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      try {
        await putDescription({
          orderId: 'order1',
          accessToken: 'access_token',
          formData,
        });
      } catch (err) {
        expect(err).toEqual({ response: { data: { errors: [{}] }, status: 400 } });
      }
    });
  });

  describe('with no errors', () => {
    it('should post correctly formatted data', async () => {
      putData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await putDescription({
        orderId: 'order1',
        accessToken: 'access_token',
        formData,
      });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/sections/description`,
        body: { description: 'some description' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should trim whitespace from the data', async () => {
      const mockData = { description: '  an order description ' };
      putData.mockResolvedValueOnce({});

      await putDescription({ orderId: 'order1', formData: mockData, accessToken: 'access_token' });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/sections/description`,
        body: { description: 'an order description' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true and orderId if data is saved successfully', async () => {
      putData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      const response = await putDescription({
        orderId: 'order1',
        accessToken: 'access_token',
        formData,
      });

      expect(response.success).toEqual(true);
      expect(response.orderId).toEqual('order1');
      expect(response.errors).toEqual(undefined);
    });
  });
});
