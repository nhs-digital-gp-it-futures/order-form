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
      ${undefined}  | ${undefined}      | ${`${catalogueItemsUrl}?publishedStatus=published`}
      ${''}         | ${''}             | ${`${catalogueItemsUrl}?publishedStatus=published`}
      ${'\t'}       | ${'\t'}           | ${`${catalogueItemsUrl}?publishedStatus=published`}
      ${'supplier'} | ${undefined}      | ${`${catalogueItemsUrl}?publishedStatus=published&supplierId=supplier`}
      ${'supplier'} | ${''}             | ${`${catalogueItemsUrl}?publishedStatus=published&supplierId=supplier`}
      ${'supplier'} | ${'\t'}           | ${`${catalogueItemsUrl}?publishedStatus=published&supplierId=supplier`}
      ${undefined}  | ${'solution'}     | ${`${catalogueItemsUrl}?publishedStatus=published&catalogueItemType=solution`}
      ${''}         | ${'solution'}     | ${`${catalogueItemsUrl}?publishedStatus=published&catalogueItemType=solution`}
      ${'\t'}       | ${'solution'}     | ${`${catalogueItemsUrl}?publishedStatus=published&catalogueItemType=solution`}
      ${'supplier'} | ${'solution'}     | ${`${catalogueItemsUrl}?publishedStatus=published&supplierId=supplier&catalogueItemType=solution`}
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
