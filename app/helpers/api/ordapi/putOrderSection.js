import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderSectionEndpoint = (orderId, sectionId) => `${orderApiUrl}/api/v1/orders/${orderId}/sections/${sectionId}`;

export const putOrderSection = async ({ orderId, sectionId, accessToken }) => {
  const endpoint = getOrderSectionEndpoint(orderId, sectionId);

  const body = {
    status: 'complete',
  };

  await putData({
    endpoint, body, accessToken, logger,
  });

  logger.info(`Updated order section ('${sectionId}') status to 'complete' for orderId '${orderId}'`);
  return { success: true };
};
