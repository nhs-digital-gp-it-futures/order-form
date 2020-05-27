import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { getContext } from './contextCreator';
import { logger } from '../../../../logger';

export const getSupplierPageContext = async ({ orderId, supplierId, accessToken }) => {
  const getSupplierDataEndpoint = getEndpoint({ endpointLocator: 'getSupplier', options: { supplierId } });
  const supplierData = await getData({ endpoint: getSupplierDataEndpoint, accessToken, logger });

  const context = getContext({ orderId, supplierData });
  return context;
};
