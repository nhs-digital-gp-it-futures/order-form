import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../../config';
import { logger } from '../../../../../logger';
import * as contextCreator from './contextCreator';
import {
  getAssociatedServicesPageContext,
} from './controller';

jest.mock('buying-catalogue-library');
jest.mock('../../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const accessToken = 'access_token';
const orderId = 'order-id';

describe('associated-services controller', () => {
  describe('getAssociatedServicesPageContext', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call getData with the correct params', async () => {
      getData.mockResolvedValueOnce({});

      await getAssociatedServicesPageContext({ orderId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/sections/description`,
        accessToken,
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ description: 'some order' });
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAssociatedServicesPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(
        { orderId, orderDescription: 'some order' },
      );
    });
  });
});
