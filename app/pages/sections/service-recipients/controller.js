import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getServiceRecipientsContext = async ({ orderId, orgId, accessToken }) => {
  let organisationData;
  let selectedServiceRecipientsData;

  try {
    const serviceRecipientEndpoint = getEndpoint({ endpointLocator: 'getServiceRecipientsFromOapi', options: { orgId } });
    organisationData = await getData({
      endpoint: serviceRecipientEndpoint,
      accessToken,
      logger,
    });
    logger.info(`Service recipients for organisation with id: ${orgId} found in OAPI. ${organisationData}`);
  } catch (err) {
    logger.error(`No selected service recipients data returned from OAPI for order id: ${orgId}. ${err}`);
    throw new Error();
  }

  try {
    const selectedServiceRecipientsEndpoint = getEndpoint({ endpointLocator: 'getSelectedServiceRecipientsFromOrdapi', options: { orderId } });
    selectedServiceRecipientsData = await getData({
      endpoint: selectedServiceRecipientsEndpoint,
      accessToken,
      logger,
    });
    logger.info(`${selectedServiceRecipientsData.serviceRecipients.length} selected service recipients found in ORDAPI.`);
  } catch (err) {
    console.log('***', err)

    logger.error(`No service recipients data returned from OAPI for org id: ${orgId}. ${err}`);
    throw new Error();
  }

  return getContext({ orderId });
};
