import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getCommencementDateEndpoint = orderId => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/commencement-date`
);

export const getCommencementDate = async ({ orderId, accessToken }) => {
  const endpoint = getCommencementDateEndpoint(orderId);
  const commencementDateData = await getData({ endpoint, accessToken, logger });
  logger.info(`Commencement date ${commencementDateData ? '' : 'not '}found for ${orderId}`);

  return commencementDateData;
};
