import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const checkOrdapiForSupplier = async ({ orderId, accessToken }) => {
  const ordapiSupplierDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getSupplier', options: { orderId } });
  const ordapiSupplierData = await getData({
    endpoint: ordapiSupplierDataEndpoint, accessToken, logger,
  });
  return !!(ordapiSupplierData && ordapiSupplierData.name);
};
