import { postData } from 'buying-catalogue-library';
import { postOrPatchDescription } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

jest.mock('buying-catalogue-library');

describe('description controller', () => {
  describe('postOrPatchDescription', () => {
    afterEach(() => {
      postData.mockReset();
    });

    it('should call postData once with the correct params for neworder', async () => {
      postData
        .mockResolvedValueOnce({ data: { orderId: 'order1' } });

      await postOrPatchDescription({ orderId: 'neworder', data: { description: 'an order description' }, accessToken: 'access_token' });
      expect(postData.mock.calls.length).toEqual(1);
      expect(postData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/order`,
        body: { orderDescription: 'an order description' },
        accessToken: 'access_token',
        logger,
      });
    });

    it('should return true if api request is successful', async () => {
      postData
        .mockResolvedValueOnce({ data: { orderId: 'order1' } });

      const response = await postOrPatchDescription({ orderId: 'neworder', data: { description: 'an order description' }, accessToken: 'access_token' });

      expect(response.success).toEqual(true);
    });

    // TODO: validation
    // it('should return error.respose.data if api request is unsuccessful with 400', async () => {
    //   postData
    //     .mockRejectedValueOnce({ response: { status: 400, data: '400 response data' } });

    // const response = await postOrPatchDescription({
    // orderId: 'neworder',
    // data: { description: 'an order description' },
    // accessToken: 'access_token' });

    //   expect(response).toEqual('400 response data');
    // });

    // it('should throw an error if api request is unsuccessful with non 400', async () => {
    //   postData
    //     .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

    //   try {
    // await postOrPatchDescription({orderId:
    // 'neworder',
    // data: { description: 'an order description' },
    // accessToken: 'access_token' });
    //   } catch (err) {
    //     expect(err).toEqual(new Error());
    //   }
    // });
  });
});
