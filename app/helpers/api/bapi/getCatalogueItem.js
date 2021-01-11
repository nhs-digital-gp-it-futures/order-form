import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getCatalogueItemEndpoint = (itemId) => (
  `${solutionsApiUrl}/api/v1/catalogue-items/${itemId}`
);

export const getCatalogueItem = async ({ itemId, accessToken }) => {
  const endpoint = getCatalogueItemEndpoint(itemId);
  const catalogueItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrieved catalogue item from BAPI for ${itemId}`);

  return catalogueItem;
};
