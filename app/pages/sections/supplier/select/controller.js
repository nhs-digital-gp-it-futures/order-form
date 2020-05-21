import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';

export const findSuppliers = async ({ supplierNameToFind, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSearchSuppliers', options: { supplierNameToFind } });
  const suppliersFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for "${supplierNameToFind}" returned ${suppliersFound.length} supplier`);

  return suppliersFound;
};
