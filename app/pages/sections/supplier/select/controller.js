import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const findSuppliers = async ({ supplierNameToFind, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSearchSuppliers', options: { supplierNameToFind } });
  const suppliersFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for "${supplierNameToFind}" returned ${suppliersFound.length} supplier`);

  return suppliersFound;
};

export const getSupplierSelectPageContext = ({ orderId }) => (
  getContext({ orderId })
);
