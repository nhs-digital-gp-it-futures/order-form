import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';
import { getRecipients as getRecipientsFromOrdapi } from '../../../helpers/api/ordapi/getRecipients';

export const getServiceRecipientsContext = async ({
  orderId, orgId, accessToken, selectStatus,
}) => {
  let selectedData;

  const serviceRecipientEndpoint = getEndpoint({ api: 'oapi', endpointLocator: 'getServiceRecipients', options: { orgId } });
  const serviceRecipientsData = await getData({
    endpoint: serviceRecipientEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Service recipients for organisation with id: ${orgId} found in OAPI.`);

  try {
    selectedData = await getRecipientsFromOrdapi({ orderId, accessToken });
  } catch (err) {
    logger.error(`Error getting service recipients data from ORDAPI for org id: ${orgId}. ${JSON.stringify(err)}`);
    throw new Error();
  }

  return getContext({
    orderId,
    serviceRecipientsData,
    selectedRecipientIdsData: selectedData ? selectedData.serviceRecipients : [],
    selectStatus,
  });
};
