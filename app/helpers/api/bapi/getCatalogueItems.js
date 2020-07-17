import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getCatalogueItemsQueryString = ({ supplierId, catalogueItemType }) => {
  const queryParameters = [];

  if (supplierId && supplierId.trim().length > 0) {
    queryParameters.push(`supplierId=${supplierId.trim()}`);
  }

  if (catalogueItemType && catalogueItemType.trim().length > 0) {
    queryParameters.push(`catalogueItemType=${catalogueItemType.trim()}`);
  }

  return queryParameters.length > 0
    ? `?${queryParameters.join('&')}`
    : '';
};

const getCatalogueItemsEndpoint = ({ supplierId, catalogueItemType }) => {
  const queryString = getCatalogueItemsQueryString({ supplierId, catalogueItemType });
  return `${solutionsApiUrl}/api/v1/catalogue-items${queryString}`;
};

export const getCatalogueItems = async ({ supplierId, catalogueItemType }) => {
  const endpoint = getCatalogueItemsEndpoint({ supplierId, catalogueItemType });
  logger.info(`Retrieving ${catalogueItemType} catalogue items from BAPI for supplier ${supplierId}`);

  return getData({ endpoint, logger });
};
