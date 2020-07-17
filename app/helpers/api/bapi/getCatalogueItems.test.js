import { getData } from 'buying-catalogue-library';
import { getCatalogueItems } from './getCatalogueItems';
import { solutionsApiUrl } from '../../../config';
import { logger } from '../../../logger';

jest.mock('buying-catalogue-library');

describe('getCatalogueItems', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const catalogueItemsUrl = `${solutionsApiUrl}/api/v1/catalogue-items`;

  it.each`
      supplierId    | catalogueItemType | expectedEndpoint
      ${undefined}  | ${undefined}      | ${catalogueItemsUrl}
      ${''}         | ${''}             | ${catalogueItemsUrl}
      ${'\t'}       | ${'\t'}           | ${catalogueItemsUrl}
      ${'supplier'} | ${undefined}      | ${`${catalogueItemsUrl}?supplierId=supplier`}
      ${'supplier'} | ${''}             | ${`${catalogueItemsUrl}?supplierId=supplier`}
      ${'supplier'} | ${'\t'}           | ${`${catalogueItemsUrl}?supplierId=supplier`}
      ${undefined}  | ${'solution'}     | ${`${catalogueItemsUrl}?catalogueItemType=solution`}
      ${''}         | ${'solution'}     | ${`${catalogueItemsUrl}?catalogueItemType=solution`}
      ${'\t'}       | ${'solution'}     | ${`${catalogueItemsUrl}?catalogueItemType=solution`}
      ${'supplier'} | ${'solution'}     | ${`${catalogueItemsUrl}?supplierId=supplier&catalogueItemType=solution`}
    `('getCatalogueItems calls getData with the correct params for supplier "$supplierId" and catalogue item type "$catalogueItemType"', async ({ supplierId, catalogueItemType, expectedEndpoint }) => {
  getData.mockResolvedValueOnce({ data: {} });
  await getCatalogueItems({ supplierId, catalogueItemType, accessToken: 'access_token' });

  expect(getData.mock.calls.length).toEqual(1);
  expect(getData).toHaveBeenCalledWith({
    endpoint: expectedEndpoint,
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
