import { getData, putData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../../config';
import { logger } from '../../../../../logger';
import * as contextCreator from './contextCreator';
import {
  getCatalogueSolutionsPageContext,
  putCatalogueSolutions,
} from './controller';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderItems');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('catalogue-solutions controller', () => {
  describe('getCatalogueSolutionsPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getData.mockResolvedValueOnce({});

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType: 'Solution',
        accessToken,
      });
    });

    it('should call getData with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getData.mockResolvedValueOnce({});

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/description`,
        accessToken,
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getData
        .mockResolvedValueOnce({ description: 'some order' });
      contextCreator.getContext.mockResolvedValueOnce({});

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription: 'some order', orderItems: [] });
    });
  });

  describe('putCatalogueSolutions', () => {
    afterEach(() => {
      putData.mockReset();
    });

    const formattedPutData = {
      status: 'complete',
    };

    it('should call putData once with the correct params', async () => {
      putData.mockResolvedValueOnce({});

      await putCatalogueSolutions({
        orderId, accessToken,
      });

      expect(putData.mock.calls.length).toEqual(1);
      expect(putData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/catalogue-solutions`,
        body: formattedPutData,
        accessToken,
        logger,
      });
    });

    it('should return success: true if put is successful', async () => {
      putData.mockResolvedValueOnce({});

      const response = await putCatalogueSolutions({
        orderId, accessToken,
      });
      expect(response).toEqual({ success: true });
    });

    it('should throw an error if api request is unsuccessful with non 400', async () => {
      putData.mockRejectedValueOnce({ response: { status: 500, data: '500 response data' } });

      try {
        await putCatalogueSolutions({
          orderId: 'order-id', accessToken: 'access_token',
        });
      } catch (err) {
        expect(err).toEqual(new Error());
      }
    });
  });
});
