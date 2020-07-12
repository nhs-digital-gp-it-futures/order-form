import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { getEndpoint } from '../../../endpoints';

export const getCatalogueItem = async ({ itemId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getCatalogueItem', options: { itemId } });
  const catalogueItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrieved catalogue item from BAPI for ${itemId}`);

  return catalogueItem;
};
