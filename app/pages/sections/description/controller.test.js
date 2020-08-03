import { postData, putData, fakeSessionManager } from 'buying-catalogue-library';
import { postOrPutDescription, getDescriptionContext } from './controller';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import * as contextCreator from './contextCreator';
import { getOrderDescription } from '../../../helpers/routes/getOrderDescription';

jest.mock('buying-catalogue-library');
jest.mock('../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../helpers/routes/getOrderDescription');

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

    it('should return error.respose.data if api request is unsuccessful with 400', async () => {
      const responseData = { description: 'an order description', errors: [{}] };
      postData
        .mockRejectedValueOnce({ response: { status: 400, data: responseData } });

      const response = await postOrPutDescription({
        orderId: 'neworder',
        data: { description: 'an order description' },
        accessToken: 'access_token',
      });

      expect(response).toEqual(responseData);
    });

    it('should throw an error if api request is unsuccessful with non 400', async () => {
      postData
        .mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

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

    it('should trim whitespace from the data', async () => {
      const mockData = { description: '  an order description ' };

      putData
        .mockResolvedValueOnce({});

      await postOrPutDescription({ orderId: 'order-id', data: mockData, accessToken: 'access_token' });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/description`,
        body: { description: 'an order description' },
        accessToken: 'access_token',
        logger,
      });
    });
  });
});
