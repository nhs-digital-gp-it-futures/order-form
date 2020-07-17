import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getCatalogueItemsEndpoint = (supplierId, catalogueItemType) => (
  `${solutionsApiUrl}/api/v1/catalogue-items?supplierId=${supplierId}&catalogueItemType=${catalogueItemType}`
);

export const getCatalogueItems = async ({ supplierId, catalogueItemType, accessToken }) => {
  const endpoint = getCatalogueItemsEndpoint(supplierId, catalogueItemType);
  const catalogueItems = await getData({ endpoint, accessToken, logger });
  logger.info(`Found ${catalogueItems.length} item(s) for supplier "${supplierId}".`);

  return catalogueItems;
};
