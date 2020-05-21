import { getData } from 'buying-catalogue-library';
import { findSuppliers } from './controller';
import { solutionsApiUrl } from '../../../../config';
import { logger } from '../../../../logger';

jest.mock('buying-catalogue-library');

describe('supplier select controller', () => {
  describe('findSuppliers', () => {
    afterEach(() => {
      getData.mockReset();
    });

    it('should call getData once with the correct params', async () => {
      getData
        .mockResolvedValueOnce({ data: [] });

      await findSuppliers({ supplierNameToFind: 'some-supp', accessToken: 'access_token' });
      expect(getData.mock.calls.length).toEqual(1);
      expect(getData).toHaveBeenCalledWith({
        endpoint: `${solutionsApiUrl}/api/v1/suppliers?name=some-supp`,
        accessToken: 'access_token',
        logger,
      });
    });
  });
});
