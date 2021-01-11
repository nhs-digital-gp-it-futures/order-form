import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const getRecipientsEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/service-recipients`
);

export const getRecipients = async ({ orderId, accessToken }) => {
  const endpoint = getRecipientsEndpoint(orderId);
  const serviceRecipientsData = await getData({ endpoint, accessToken, logger });
  logger.info(`${serviceRecipientsData.serviceRecipients ? serviceRecipientsData.serviceRecipients : 'No'} selected service recipients found in ORDAPI.`);

  return serviceRecipientsData.serviceRecipients;
};
