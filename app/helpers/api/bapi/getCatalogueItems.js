import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getCatalogueItemsEndpoint = (supplierId, catalogueItemType) => (
  `${solutionsApiUrl}/api/v1/catalogue-items?supplierId=${supplierId}&catalogueItemType=${catalogueItemType}`
);

export const getCatalogueItems = async ({ supplierId, catalogueItemType, accessToken }) => {
  const endpoint = getCatalogueItemsEndpoint(supplierId, catalogueItemType);
  const catalogueItems = await getData({ endpoint, accessToken, logger });

  if (catalogueItems && catalogueItems.length > 0) {
    logger.info(`Found ${catalogueItems.length} item(s) for supplier "${supplierId}".`);
    return catalogueItems;
  }

  logger.error(`No catalogueItems returned for supplier ${supplierId} and catalogueItemType ${catalogueItemType}`);
  throw new Error();
};
