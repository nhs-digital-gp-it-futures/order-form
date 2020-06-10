import { getData } from 'buying-catalogue-library';
import { orderApiUrl, solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import {
  getSolutionRecipientPageContext,
  getRecipients,
  getSolution,
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

  describe('getSolution', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    const accessToken = 'access_token';
    const solutionId = 'sol-1';

    it('should call getData with the correct params when hasSavedData is true', async () => {
      getData.mockResolvedValueOnce({ supplierId: 'supp-1' });

      await getSolution({ solutionId, accessToken });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/solutions/${solutionId}`,
        accessToken,
        logger,
      });
    });
  });
});
