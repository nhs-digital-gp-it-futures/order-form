import { putData } from 'buying-catalogue-library';
import { putFundingSource } from './putFundingSource';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('putOrderItem', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });


  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      const responseData = { errors: [{}] };
      putData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      try {
        await putFundingSource({
          orderId: 'order1',
          accessToken: 'access_token',
          fundingSource: true,
        });
      } catch (err) {
        expect(err).toEqual({ response: { data: { errors: [{}] }, status: 400 } });
      }
    });
  });

  describe('with no errors', () => {
    it('should post correctly formatted data', async () => {
      putData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await putFundingSource({
        orderId: 'order1',
        accessToken: 'access_token',
        fundingSource: true,
      });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order1/funding-source`,
        body: {
          onlyGMS: true,
        },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true if data is saved successfully', async () => {
      const response = await putFundingSource({
        orderId: 'order1',
        accessToken: 'access_token',
        fundingSource: true,
      });

      expect(response.success).toEqual(true);
      expect(response.errors).toEqual(undefined);
    });
  });
});
