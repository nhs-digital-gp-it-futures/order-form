import { getData } from 'buying-catalogue-library';
import { getTaskListPageContext } from './controller';
import * as contextCreator from './contextCreator';
import { orderApiUrl } from '../../config';
import { logger } from '../../logger';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('order-task-list controller', () => {
  describe('getNewOrderPageContext', () => {
    it('should call getContext with the correct params when user data is returned by the apiProvider', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getTaskListPageContext({ orderId: 'neworder' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'neworder' });
    });
  });

  describe('getExistingOrderPageContext', () => {
    const mockExistingOrderData = {
      orderId: 'order-id',
      description: 'Some description',
    };

    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData.mockResolvedValueOnce(mockExistingOrderData);

      await getTaskListPageContext({
        orderId: 'order-id',
        accessToken: 'access_token',
      });

      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/summary`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call getContext with the correct params when existing order data is returned by getData', async () => {
      getData.mockResolvedValueOnce(mockExistingOrderData);
      contextCreator.getContext.mockResolvedValueOnce();

      await getTaskListPageContext({
        orderId: 'order-id',
        accessToken: 'access_token',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-id', orderDescription: mockExistingOrderData.description });
    });
  });
});
