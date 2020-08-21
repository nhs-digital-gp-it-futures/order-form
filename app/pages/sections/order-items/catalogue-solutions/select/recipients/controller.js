import { getContext } from './contextCreator';

export const getServiceRecipientsContext = async ({
  orderId, itemName, selectStatus, serviceRecipients,
}) => getContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: [],
  selectStatus,
});
