import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getOrderSummaryEndpoint = (orderId) => `${orderApiUrl}/api/v1/orders/${orderId}/summary`;

export const getOrderSummary = async ({ orderId, accessToken }) => {
  const endpoint = getOrderSummaryEndpoint(orderId);
  const orderSummaryData = await getData({
    endpoint, accessToken, logger,
  });
  logger.info(`Order summary data returned for '${orderId}'`);

  return {
    orderId: orderSummaryData.orderId,
    description: orderSummaryData.description,
    sections: orderSummaryData.sections,
    enableSubmitButton: orderSummaryData.sectionStatus ? orderSummaryData.sectionStatus.toLowerCase() === 'complete' : false,
  };
};
