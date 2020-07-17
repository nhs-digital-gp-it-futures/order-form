import { getData } from 'buying-catalogue-library';
import { getCatalogueItems } from './getCatalogueItems';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getCatalogueItems', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getData once with the correct params', async () => {
    getData.mockResolvedValueOnce([{}]);

    await getCatalogueItems({ supplierId: 'supp-1', catalogueItemType: 'Solution', accessToken: 'access_token' });
    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({
      endpoint: `${solutionsApiUrl}/api/v1/catalogue-items?supplierId=supp-1&catalogueItemType=Solution`,
      accessToken: 'access_token',
      logger,
    });
  });

  it('should return the catalogueItems', async () => {
    const expectedCatalogueItems = [{}, {}];

    getData.mockResolvedValueOnce(expectedCatalogueItems);

    const response = await getCatalogueItems({
      supplierId: 'supp-1',
      catalogueItemType: 'Solution',
      accessToken: 'access_token',
    });

    expect(response).toEqual(expectedCatalogueItems);
  });

  it('should throw an Error if no catalogueItems are returned', async () => {
    getData.mockResolvedValueOnce(undefined);

    try {
      await getCatalogueItems({
        supplierId: 'supp-1',
        catalogueItemType: 'Solution',
        accessToken: 'access_token',
      });
    } catch (err) {
      expect(err).toEqual(new Error());
    }
  });

  it('should throw an Error if catalogueItems returned is an empty list', async () => {
    getData.mockResolvedValueOnce([]);

    try {
      await getCatalogueItems({
        supplierId: 'supp-1',
        catalogueItemType: 'Solution',
        accessToken: 'access_token',
      });
    } catch (err) {
      expect(err).toEqual(new Error());
    }
  });
});
