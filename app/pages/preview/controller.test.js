import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../config';
import { logger } from '../../logger';
import {
  getOrder,
  getPreviewPageContext,
} from './controller';
import * as contextCreator from './contextCreator';
import * as transformOrderItems from './transformOrderItems';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

jest.mock('./transformOrderItems', () => ({
  transformOrderItems: jest.fn(),
}));

describe('order summary preview controller', () => {
  describe('getOrder', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    const accessToken = 'access_token';
    const orderId = 'order-id';

    it('should call getData with the correct params', async () => {
      getData.mockResolvedValueOnce({});

      await getOrder({ orderId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id`,
        accessToken,
        logger,
      });
    });
  });

  describe('getPreviewPageContext', () => {
    it('should call transformOrderItems with the correct params', async () => {
      transformOrderItems.transformOrderItems.mockResolvedValueOnce();

      await getPreviewPageContext({ orderId: 'order-1', orderData: { orderItems: [17] } });

      expect(transformOrderItems.transformOrderItems.mock.calls.length).toEqual(1);
      expect(transformOrderItems.transformOrderItems).toHaveBeenCalledWith([17]);
    });

    it('should call getContext with the correct params', async () => {
      contextCreator.getContext.mockReset();
      contextCreator.getContext
        .mockResolvedValueOnce();

      transformOrderItems.transformOrderItems.mockResolvedValueOnce();

      await getPreviewPageContext({ orderId: 'order-1', orderData: { } });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', orderData: { } });
    });
  });
});
