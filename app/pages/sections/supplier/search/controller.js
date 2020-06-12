import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext, getErrorContext } from './contextCreator';

export const getSupplierSearchPageContext = async ({ orderId }) => (
  getContext({ orderId })
);

export const validateSupplierSearchForm = ({ data }) => {
  if (data.supplierName && data.supplierName.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'supplierName',
      id: 'SupplierNameRequired',
    },
  ];
  return { success: false, errors };
};

export const findSuppliers = async ({ name, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getSearchSuppliers', options: { name } });
  const suppliersFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for "${name}" returned ${suppliersFound.length} suppliers`);

  return suppliersFound;
};

export const getSupplierSearchPageErrorContext = params => getErrorContext(params);
