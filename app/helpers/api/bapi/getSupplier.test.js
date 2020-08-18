import { getData } from 'buying-catalogue-library';
import { getSupplier } from './getSupplier';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getSupplier', () => {
  afterEach(() => {
    getData.mockReset();
  });

  const accessToken = 'access_token';
  const supplierId = 'sup-1';

  it('should call getData with the correct params', async () => {
    getData.mockResolvedValueOnce({ supplierId: 'supp-1' });

    await getSupplier({ supplierId, accessToken });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/suppliers/${supplierId}`,
      accessToken,
      logger,
    });
  });
});
