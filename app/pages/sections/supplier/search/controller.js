import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';

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

export const getSupplierSearchPageErrorContext = params => getErrorContext(params);

export const findSuppliers = async ({ supplierNameToFind, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSearchSuppliers', options: { supplierNameToFind } });
  const suppliersFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching ${supplierNameToFind} returned ${suppliersFound.length}`);
};
