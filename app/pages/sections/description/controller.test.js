import { postData, putData } from 'buying-catalogue-library';
import { postOrPutDescription } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

jest.mock('buying-catalogue-library');

describe('description controller', () => {
  describe('postOrPutDescription', () => {
    afterEach(() => {
      postData.mockReset();
      putData.mockReset();
    });

    it('should call postData once with the correct params for neworder', async () => {
      postData
        .mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await postOrPutDescription({
        orgId: 'org-id', orderId: 'neworder', data: { description: 'an order description' }, accessToken: 'access_token',
      });
      expect(postData.mock.calls.length).toEqual(1);
      expect(postData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders`,
        body: { description: 'an order description', organisationId: 'org-id' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call putData once with the correct params for existing order', async () => {
      putData
        .mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await postOrPutDescription({
        orgId: 'org-id', orderId: 'order-id', data: { description: 'an order description' }, accessToken: 'access_token',
      });
      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/description`,
        body: { description: 'an order description' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return true if api request is successful', async () => {
      postData
        .mockResolvedValueOnce({ data: { orderId: 'order1' } });

      const response = await postOrPutDescription({ orderId: 'neworder', data: { description: 'an order description' }, accessToken: 'access_token' });

      expect(response.success).toEqual(true);
    });

    // TODO: validation
    // it('should return error.respose.data if api request is unsuccessful with 400', async () => {
    //   postData
    //     .mockRejectedValueOnce({ response: { status: 400, data: '400 response data' } });

    // const response = await postOrPutDescription({
    // orderId: 'neworder',
    // data: { description: 'an order description' },
    // accessToken: 'access_token' });

    //   expect(response).toEqual('400 response data');
    // });

    // it('should throw an error if api request is unsuccessful with non 400', async () => {
    //   postData
    //     .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

    //   try {
    // await postOrPutDescription({orderId:
    // 'neworder',
    // data: { description: 'an order description' },
    // accessToken: 'access_token' });
    //   } catch (err) {
    //     expect(err).toEqual(new Error());
    //   }
    // });
  });
});
