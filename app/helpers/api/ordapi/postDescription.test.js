import { postData } from 'buying-catalogue-library';
import { postDescription } from './postDescription';
import { orderApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('postDescription', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const formData = {
    description: 'some description',
  };

  describe('with errors', () => {
    it('should throw an error if api request is unsuccessful', async () => {
      const responseData = { errors: [{}] };
      postData.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      try {
        await postDescription({
          orgId: 'org1',
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
      postData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await postDescription({
        orgId: 'org1',
        accessToken: 'access_token',
        formData,
      });

      expect(postData.mock.calls.length).toEqual(1);
      expect(postData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders`,
        body: {
          description: 'some description',
          organisationId: 'org1',
        },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return success as true and orderId if data is saved successfully', async () => {
      postData.mockResolvedValueOnce({ data: { orderId: 'order1' } });

      const response = await postDescription({
        orgId: 'org1',
        accessToken: 'access_token',
        formData,
      });

      expect(response.success).toEqual(true);
      expect(response.orderId).toEqual('order1');
      expect(response.errors).toEqual(undefined);
    });
  });
});
