import { getData } from 'buying-catalogue-library';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';
import {
  getCatalogueItemPricing,
} from './getCatalogueItemPricing';

const accessToken = 'access_token';
const catalogueItemId = 'associated-service-1';

describe('findAssociatedServicePrices', () => {
  afterEach(() => {
    getData.mockReset();
  });

  it('should call getData once with the correct params', async () => {
    getData.mockResolvedValueOnce({ data: {} });

    await getCatalogueItemPricing({ accessToken, catalogueItemId });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/prices?catalogueItemId=${catalogueItemId}`,
      accessToken: 'access_token',
      logger,
    });
  });
});
