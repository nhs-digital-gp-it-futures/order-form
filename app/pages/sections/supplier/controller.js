import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const checkOrdapiForSupplier = async ({ orderId, accessToken }) => {
  const ordapiSupplierDataEndpoint = getEndpoint({ endpointLocator: 'getOrdapiSupplier', options: { orderId } });
  const ordapiSupplierData = await getData({
    endpoint: ordapiSupplierDataEndpoint, accessToken, logger,
  });
  return !!(ordapiSupplierData && ordapiSupplierData.name);
};
