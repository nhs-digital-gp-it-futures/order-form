import { getTaskListPageContext } from './controller';
import * as contextCreator from './contextCreator';
import { getOrderSummary } from '../../helpers/api/ordapi/getOrderSummary';

jest.mock('../../helpers/api/ordapi/getOrderSummary');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('task-list controller', () => {
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
      sections: [],
      enableSubmitButton: false,
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderSummary once with the correct params', async () => {
      getOrderSummary.mockResolvedValueOnce(mockExistingOrderData);

      await getTaskListPageContext({
        orderId: 'order-id',
        accessToken: 'access_token',
      });

      expect(getOrderSummary.mock.calls.length).toEqual(1);
      expect(getOrderSummary).toHaveBeenCalledWith({
        orderId: 'order-id',
        accessToken: 'access_token',
      });
    });

    it('should call getContext with the correct params when existing order data is returned by getData', async () => {
      getOrderSummary.mockResolvedValueOnce(mockExistingOrderData);
      contextCreator.getContext.mockResolvedValueOnce();

      await getTaskListPageContext({
        orderId: 'order-id',
        accessToken: 'access_token',
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId: 'order-id',
        orderDescription: mockExistingOrderData.description,
        sectionsData: [],
        enableSubmitButton: false,
      });
    });
  });
});
