import { putData } from 'buying-catalogue-library';
import { putCommencementDate } from './putCommencementDate';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

const mockData = {
  'commencementDate-day': '21',
  'commencementDate-month': '12',
  'commencementDate-year': '2020',
};

describe('putCommencementDate', () => {
  describe('with errors', () => {
    it('should return error.respose.data if api request is unsuccessful with 400', async () => {
      const responseData = { errors: [{}] };
      putData
        .mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      const response = await putCommencementDate({
        orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });

      expect(response).toEqual(responseData);
    });

    it('should throw an error if api request is unsuccessful with non 400', async () => {
      putData
        .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

      try {
        await putCommencementDate({
          orderId: 'order-id', data: mockData, accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual(new Error());
      }
    });
  });

  describe('with no errors', () => {
    beforeEach(() => {
      putData.mockReset();
    });

    it('should call putData once with the correct params', async () => {
      putData.mockResolvedValueOnce({});

      await putCommencementDate({
        orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });
      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/commencement-date`,
        body: { commencementDate: '2020-12-21' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call putData once with the correct params when day and month are single digit', async () => {
      putData
        .mockResolvedValueOnce({});

      const data = {
        'commencementDate-day': '1',
        'commencementDate-month': '2',
        'commencementDate-year': '2020',
      };

      await putCommencementDate({
        orderId: 'order-id', data, accessToken: 'access_token',
      });
      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/commencement-date`,
        body: { commencementDate: '2020-02-01' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if data is saved successfully', async () => {
      putData
        .mockResolvedValueOnce({});
      const response = await putCommencementDate({
        orderId: 'order-id', data: mockData, accessToken: 'access_token',
      });
      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
