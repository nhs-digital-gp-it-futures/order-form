import { getData } from 'buying-catalogue-library';
import * as contextCreator from './contextCreator';
import { logger } from '../../../../logger';
import { solutionsApiUrl } from '../../../../config';
import { getSupplierPageContext } from './controller';

jest.mock('buying-catalogue-library');

jest.mock('./contextCreator', () => ({
  getContext: jest.fn(),
}));

describe('supplier controller', () => {
  describe('getSupplierPageContext', () => {
    afterEach(() => {
      getData.mockReset();
      contextCreator.getContext.mockReset();
    });

    it('should call getData with the correct params', async () => {
      getData.mockResolvedValueOnce({});

      await getSupplierPageContext({ orderId: 'order-id', supplierId: 'supp-id', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/suppliers/supp-id`,
        accessToken: 'access_token',
        logger,
      });
    });

    it('should call getContext with the correct params', async () => {
      getData.mockResolvedValueOnce({});
      contextCreator.getContext.mockResolvedValueOnce({});

      await getSupplierPageContext({ orderId: 'order-1' });

      expect(contextCreator.getContext.mock.calls.length).toEqual(1);
      expect(contextCreator.getContext).toHaveBeenCalledWith({ orderId: 'order-1', supplierData: {} });
    });
  });
});
