import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const findSuppliers = async ({ name, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSearchSuppliers', options: { name } });
  const suppliersFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for "${name}" returned ${suppliersFound.length} supplier`);

  return suppliersFound;
};

export const getSupplierSelectPageContext = params => getContext(params);
