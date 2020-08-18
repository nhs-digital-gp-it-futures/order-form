import { fakeSessionManager } from 'buying-catalogue-library';
import { postOrPutDescription, getDescriptionContext } from './controller';
import { logger } from '../../../logger';
import * as contextCreator from './contextCreator';
import { getOrderDescription } from '../../../helpers/routes/getOrderDescription';
import { postDescription } from '../../../helpers/api/ordapi/postDescription';
import { putDescription } from '../../../helpers/api/ordapi/putDescription';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/routes/getOrderDescription');
jest.mock('../../../helpers/api/ordapi/postDescription');
jest.mock('../../../helpers/api/ordapi/putDescription');

describe('description controller', () => {
  describe('getDescriptionContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderDescription once with the correct params for an order with an id', async () => {
      getOrderDescription.mockResolvedValueOnce('a lovely description');

      const orderId = 'order-id';
      const req = { params: { orderId } };
      const accessToken = 'access_token';

      await getDescriptionContext({
        req,
        orderId,
        accessToken,
        sessionManager: fakeSessionManager,
      });

      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        req,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });
    });

    it('should not call getOrderDescription for a new order', async () => {
      await getDescriptionContext({
        req: {},
        orderId: 'neworder',
        accessToken: 'access_token',
        sessionManager: fakeSessionManager,
      });

      expect(getOrderDescription.mock.calls.length).toEqual(0);
    });

    it('should call getContext with the correct params for an order with an id and data returned from getOrderDescription', async () => {
      getOrderDescription.mockResolvedValueOnce('a lovely description');
      contextCreator.getContext.mockResolvedValueOnce();

      await getDescriptionContext({
        req: {},
        orderId: 'order-id',
        accessToken: 'access_token',
        sessionManager: fakeSessionManager,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', description: 'a lovely description' });
    });

    it('should call getContext with the correct params for a new order', async () => {
      contextCreator.getContext.mockResolvedValueOnce();

      await getDescriptionContext({
        req: {},
        orderId: 'neworder',
        accessToken: 'access_token',
        sessionManager: fakeSessionManager,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'neworder', description: '' });
    });
  });

  describe('postOrPutDescription', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call postDescription once with the correct params for neworder', async () => {
      postDescription.mockResolvedValueOnce({});

      await postOrPutDescription({
        orgId: 'org-id', orderId: 'neworder', data: { description: 'an order description' }, accessToken: 'access_token',
      });
      expect(postDescription.mock.calls.length).toEqual(1);
      expect(postDescription).toHaveBeenCalledWith({
        orgId: 'org-id',
        accessToken: 'access_token',
        formData: { description: 'an order description' },
      });
    });

    it('should call putDescription once with the correct params for existing order', async () => {
      putDescription.mockResolvedValueOnce({});

      await postOrPutDescription({
        orgId: 'org-id', orderId: 'order-id', data: { description: 'an order description' }, accessToken: 'access_token',
      });
      expect(putDescription.mock.calls.length).toEqual(1);
      expect(putDescription).toHaveBeenCalledWith({
        orderId: 'order-id',
        accessToken: 'access_token',
        formData: { description: 'an order description' },
      });
    });

    it('should return success true and the order if api request to postDescription is successful', async () => {
      postDescription.mockResolvedValueOnce({ success: true, orderId: 'order1' });

      const response = await postOrPutDescription({
        orgId: 'org1', orderId: 'neworder', data: { description: 'an order description' }, accessToken: 'access_token',
      });

      expect(response.success).toEqual(true);
      expect(response.orderId).toEqual('order1');
    });

    it('should return error.respose.data if api request is unsuccessful with 400', async () => {
      const responseData = { description: 'an order description', errors: [{}] };
      postDescription.mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      const response = await postOrPutDescription({
        orderId: 'neworder',
        data: { description: 'an order description' },
        accessToken: 'access_token',
      });

      expect(response).toEqual(responseData);
    });

    it('should throw an error if api request is unsuccessful with non 400', async () => {
      postDescription.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

      try {
        await postOrPutDescription({
          orderId: 'neworder',
          data: { description: 'an order description' },
          accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual(new Error());
      }
    });
  });
});
