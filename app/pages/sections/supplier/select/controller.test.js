import { getData } from 'buying-catalogue-library';
import { findSuppliers, getSupplierSelectPageContext } from './controller';
import { solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';
import * as contextCreator from './contextCreator';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('supplier select controller', () => {
  describe('findSuppliers', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: [] });

      await findSuppliers({ name: 'some-supp', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=some-supp`,
        accessToken: 'access_token',
        logger,
      });
    });
  });

  describe('getSupplierSelectPageContext', () => {
    it('should call getContext with the correct params', async () => {
      contextCreator.getContext
        .mockResolvedValueOnce();

      await getSupplierSelectPageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1' });
    });
  });
});
