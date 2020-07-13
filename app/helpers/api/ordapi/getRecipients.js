import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getRecipients = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getSelectedServiceRecipients', options: { orderId } });
  const serviceRecipientsData = await getData({ endpoint, accessToken, logger });
  logger.info(`${serviceRecipientsData.length} service recipients returned for ${orderId}`);

  return serviceRecipientsData.serviceRecipients;
};
