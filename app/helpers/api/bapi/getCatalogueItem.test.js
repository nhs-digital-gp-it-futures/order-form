import { getData } from 'buying-catalogue-library';
import { getCatalogueItem } from './getCatalogueItem';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getCatalogueItem', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData
      .mockResolvedValueOnce({ data: {} });

    await getCatalogueItem({ itemId: 'item-1', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/catalogue-items/item-1`,
      accessToken: 'access_token',
      logger,
    });
  });
});
