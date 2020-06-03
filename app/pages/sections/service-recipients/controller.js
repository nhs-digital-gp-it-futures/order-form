import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getServiceRecipientsContext = async ({ orderId, orgId, accessToken }) => {
  let selectedServiceRecipientsData;

  const serviceRecipientEndpoint = getEndpoint({ endpointLocator: 'getServiceRecipientsFromOapi', options: { orgId } });
  const serviceRecipientsData = await getData({
    endpoint: serviceRecipientEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Service recipients for organisation with id: ${orgId} found in OAPI. ${serviceRecipientsData}`);

  try {
    const selectedServiceRecipientsEndpoint = getEndpoint({ endpointLocator: 'getSelectedServiceRecipientsFromOrdapi', options: { orderId } });
    selectedServiceRecipientsData = await getData({
      endpoint: selectedServiceRecipientsEndpoint,
      accessToken,
      logger,
    });
    logger.info(`${selectedServiceRecipientsData.serviceRecipients.length} selected service recipients found in ORDAPI.`);
  } catch (err) {
    logger.error(`No service recipients data returned from ORDAPI for org id: ${orgId}. ${err}`);
    throw new Error();
  }

  return getContext({ orderId });
};
