import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getSupplierEndpoint = (supplierId) => (
  `${solutionsApiUrl}/api/v1/suppliers/${supplierId}`
);
export const getSupplier = async ({ supplierId, accessToken }) => {
  const endpoint = getSupplierEndpoint(supplierId);
  const supplierData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrieved supplier data from BAPI for ${supplierId}`);

  return supplierData;
};
