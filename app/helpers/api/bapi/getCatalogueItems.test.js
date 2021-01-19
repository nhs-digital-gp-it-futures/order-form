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
    getData.mockResolvedValueOnce([{}]);
    await getCatalogueItems({ supplierId, catalogueItemType });

    expect(getData.mock.calls.length).toEqual(1);
    expect(getData).toHaveBeenCalledWith({ endpoint: expectedEndpoint, logger });
  });

  it('should return the catalogueItems', async () => {
    const expectedCatalogueItems = [{}, {}];

    getData.mockResolvedValueOnce(expectedCatalogueItems);

    const response = await getCatalogueItems({
      supplierId: 'supp-1',
      catalogueItemType: 'Solution',
    });

    expect(response).toEqual(expectedCatalogueItems);
  });
});
