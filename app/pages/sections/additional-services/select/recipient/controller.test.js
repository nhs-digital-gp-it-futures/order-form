import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../../config';
import { logger } from '../../../../../logger';
import {
  getSolution,
  getAdditionalServiceRecipientPageContext,
} from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('catalogue-solutions select-solution controller', () => {
  describe('getRecipientPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getAdditionalServiceRecipientPageContext({ orderId: 'order-1', solutionName: 'Solution One' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', solutionName: 'Solution One' });
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
