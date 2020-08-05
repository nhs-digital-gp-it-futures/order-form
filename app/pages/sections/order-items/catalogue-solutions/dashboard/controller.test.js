import { fakeSessionManager } from 'buying-catalogue-library';
import * as contextCreator from './contextCreator';
import {
  getCatalogueSolutionsPageContext,
} from './controller';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';
import { logger } from '../../../../../logger';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderItems');
jest.mock('../../../../../helpers/routes/getOrderDescription');

const accessToken = 'access_token';
const orderId = 'order-id';
const req = { params: { orderId } };

describe('catalogue-solutions controller', () => {
  describe('getCatalogueSolutionsPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce('some description');

      await getCatalogueSolutionsPageContext({
        req,
        orderId,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType: 'Solution',
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce('some description');

      await getCatalogueSolutionsPageContext({
        req,
        orderId,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(getOrderDescription.mock.calls.length).toEqual(1);
      expect(getOrderDescription).toHaveBeenCalledWith({
        req,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce('some description');

      contextCreator.getContext.mockResolvedValueOnce({});

      await getCatalogueSolutionsPageContext({
        req,
        orderId,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId, orderDescription: 'some description', orderItems: [] });
    });
  });
});
