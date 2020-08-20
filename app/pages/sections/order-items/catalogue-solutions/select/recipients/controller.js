import { getContext } from './contextCreator';
import { logger } from '../../../../../../logger';
import { getRecipients as getRecipientsFromOrdapi } from '../../../../../../helpers/api/ordapi/getRecipients';
import { getServiceRecipients as getRecipientsFromOapi } from '../../../../../../helpers/api/oapi/getServiceRecipients';

export const getServiceRecipientsContext = async ({
  orderId, orgId, accessToken, selectStatus,
}) => {
  let selectedData;
  try {
    selectedData = await getRecipientsFromOrdapi({ orderId, accessToken });
  } catch (err) {
    logger.error(`Error getting service recipients data from ORDAPI for org id: ${orgId}. ${JSON.stringify(err)}`);
    throw new Error();
  }

  return getContext({
    orderId,
    serviceRecipientsData: await getRecipientsFromOapi({ orgId, accessToken }),
    selectedRecipientIdsData: selectedData ? selectedData.serviceRecipients : [],
    selectStatus,
  });
};
