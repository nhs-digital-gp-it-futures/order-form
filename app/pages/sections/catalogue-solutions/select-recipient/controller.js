import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const getSolutionRecipientPageContext = params => getContext(params);

export const getSolution = async ({ solutionId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSolution', options: { solutionId } });
  const solutionData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrived solution data from BAPI for ${solutionId}`);

  return solutionData;
};

export const getRecipients = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSelectedServiceRecipientsFromOrdapi', options: { orderId } });
  const serviceRecipientsData = await getData({ endpoint, accessToken, logger });
  logger.info(`${serviceRecipientsData.length} service recipients returned for ${orderId}`);

  return serviceRecipientsData.serviceRecipients;
};
