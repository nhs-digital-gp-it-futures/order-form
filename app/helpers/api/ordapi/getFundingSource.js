import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getFundingSourceEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/funding-source`
);

export const getFundingSource = async ({ orderId, accessToken }) => {
  const endpoint = getFundingSourceEndpoint(orderId);
  const fundingSource = await getData({ endpoint, accessToken, logger });
  logger.info(`Funding source returned for ${orderId}`);

  return fundingSource.onlyGMS;
};
