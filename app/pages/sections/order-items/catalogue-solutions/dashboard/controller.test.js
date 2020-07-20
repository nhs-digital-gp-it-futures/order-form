import * as contextCreator from './contextCreator';
import {
  getCatalogueSolutionsPageContext,
} from './controller';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderItems');
jest.mock('../../../../../helpers/api/ordapi/getOrderDescription');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('catalogue-solutions controller', () => {
  describe('getCatalogueSolutionsPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType: 'Solution',
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        orderId,
        accessToken,
      });
    });

    it('should call getContext with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({ description: 'some description' });

      contextCreator.getContext.mockResolvedValueOnce({});

      await getCatalogueSolutionsPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription: 'some description', orderItems: [] });
    });
  });
});
