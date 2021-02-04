import { putData } from 'buying-catalogue-library';
import { putOrderItem } from './putOrderItem';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('putOrderItem', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const formData = {
    _csrf: 'E4xB4klq-hLgMvQGHZxQhrHUhh6gSaLz5su8',
    'deliveryDate-day': '25',
    'deliveryDate-month': '12',
    'deliveryDate-year': '2020',
    price: '500.4956789',
    quantity: '1',
    selectEstimationPeriod: 'month',
  };

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      const responseData = { errors: [{}] };
      putData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      try {
        await putOrderItem({
          orderId: 'order1',
          orderItemId: 'orderItemId-1',
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

      await putOrderItem({
        orderId: 'order1',
        orderItemId: 'orderItemId-1',
        accessToken: 'access_token',
        formData,
      });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/order-items/orderItemId-1`,
        body: {
          deliveryDate: '2020-12-25',
          quantity: 1,
          estimationPeriod: 'month',
          price: '500.4957',
        },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if data is saved successfully', async () => {
      const response = await putOrderItem({
        orderId: 'order1',
        orderItemId: 'orderItemId-1',
        accessToken: 'access_token',
        formData,
      });

      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
