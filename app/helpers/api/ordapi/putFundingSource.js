import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const formatPutData = ({ fundingSource }) => ({
  onlyGMS: fundingSource === 'true',
});

const putFundingSourceEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/funding-source`
);

export const putFundingSource = async ({ orderId, fundingSource, accessToken }) => {
  const endpoint = putFundingSourceEndpoint(orderId);
  const body = formatPutData({
    fundingSource,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Funding source updated for ${orderId}`);

  return { success: true };
};
