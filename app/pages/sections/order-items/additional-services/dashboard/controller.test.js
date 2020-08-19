import { fakeSessionManager } from 'buying-catalogue-library';
import * as contextCreator from './contextCreator';
import { getAdditionalServicesPageContext } from './controller';
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
const req = { params: { orderId } };
const catalogueItemType = 'AdditionalService';

describe('additional-services controller', () => {
  describe('getAdditionalServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getOrderItems with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({
        req,
        orderId,
        catalogueItemType,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(getOrderItems.mock.calls.length).toEqual(1);
      expect(getOrderItems).toHaveBeenCalledWith({
        orderId: 'order-id',
        catalogueItemType,
        accessToken,
      });
    });

    it('should call getOrderDescription with the correct params', async () => {
      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({
        req,
        orderId,
        catalogueItemType,
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
      const orderDescription = 'some order';

      getOrderItems.mockResolvedValueOnce([]);
      getOrderDescription.mockResolvedValueOnce(orderDescription);
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({
        req,
        orderId,
        catalogueItemType,
        accessToken,
        sessionManager: fakeSessionManager,
        logger,
      });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({
        orderId,
        orderDescription,
        orderItems: [],
      });
    });
  });
});
