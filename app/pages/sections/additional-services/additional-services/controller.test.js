import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import * as contextCreator from './contextCreator';
import {
  getAdditionalServicesPageContext,
} from './controller';

jest.mock('buying-catalogue-library');
jest.mock('../../../../logger');
jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

const accessToken = 'access_token';
const orderId = 'order-id';

describe('additional-services controller', () => {
  describe('getAdditionalServicesPageContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData with the correct params', async () => {
      getData.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({ orderId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-id/order-items?catalogueItemType=AdditionalServices`,
        accessToken,
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      getData.mockResolvedValueOnce({ orderDescription: 'some order' });
      contextCreator.getContext.mockResolvedValueOnce({});

      await getAdditionalServicesPageContext({ orderId, accessToken });
      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith(
        { orderId, orderDescription: 'some order' },
      );
    });
  });
});
