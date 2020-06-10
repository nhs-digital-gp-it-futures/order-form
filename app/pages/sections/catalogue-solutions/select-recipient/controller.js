import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const getSolutionRecipientPageContext = params => getContext(params);

export const getRecipients = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSelectedServiceRecipientsFromOrdapi', options: { orderId } });
  const serviceRecipientsData = await getData({ endpoint, accessToken, logger });
  logger.info(`${serviceRecipientsData.length} service recipients returned for ${orderId}`);

  return serviceRecipientsData.serviceRecipients;
};
