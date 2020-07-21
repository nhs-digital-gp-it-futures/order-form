import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getSupplierEndpoint = orderId => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/supplier`
);

export const getSupplier = async ({ orderId, accessToken }) => {
  const endpoint = getSupplierEndpoint(orderId);
  const supplier = await getData({ endpoint, accessToken, logger });
  logger.info(`Supplier returned for ${orderId}`);

  return supplier;
};
