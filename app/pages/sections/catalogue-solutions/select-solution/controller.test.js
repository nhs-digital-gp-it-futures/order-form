import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import { getSolutionsSelectPageContext, findSolutions } from './controller';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('catalogue-solutions select controller', () => {
  describe('getSolutionsSelectPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSolutionsSelectPageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });

  describe('findSuppliers', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: [] });

      await findSolutions({ supplierId: 'supp-1', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/solutions?supplierId=supp-1`,
        accessToken: 'access_token',
        logger,
      });
    });
  });
});
