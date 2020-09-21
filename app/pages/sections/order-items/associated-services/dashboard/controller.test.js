import { fakeSessionManager } from 'buying-catalogue-library';
import * as contextCreator from './contextCreator';
import {
  getAssociatedServicesPageContext,
} from './controller';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';
import { logger } from '../../../../../logger';

jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));
jest.mock('../../../../../helpers/api/ordapi/getOrderItems');
jest.mock('../../../../../helpers/routes/getOrderDescription');

const accessToken = 'access_token';
const orderId = 'order-id';

describe('associated-services controller', () => {
  describe('getAssociatedServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAssociatedServicesPageContext({ orderId, catalogueItemType: 'some-type', accessToken });
      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType: 'some-type',
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce('some description');

      const req = { params: { orderId } };

      await getAssociatedServicesPageContext({
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

      await getAssociatedServicesPageContext({
        req: { params: { orderId: 'order-id' } },
        orderId,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(
        { orderId, orderDescription: 'some description', orderItems: [] },
      );
    });
  });
});
