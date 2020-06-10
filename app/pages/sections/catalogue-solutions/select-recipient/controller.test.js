import { getData } from 'buying-catalogue-library';
import { orderApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getSolutionRecipientPageContext,
  getRecipients,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('catalogue-solutions select-solution controller', () => {
  describe('getSolutionRecipientPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSolutionRecipientPageContext({ orderId: 'order-1', solutionName: 'Solution One' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', solutionName: 'Solution One' });
    });
  });

  describe('getRecipients', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: {} });

      await getRecipients({ orderId: 'order-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${orderApiUrl}/api/v1/orders/order-1/sections/service-recipients`,
        accessToken: 'access_token',
        logger,
      });
    });
  });
});
