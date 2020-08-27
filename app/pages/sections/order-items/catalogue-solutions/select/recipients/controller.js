import { getContext } from './contextCreator';

export const getServiceRecipientsContext = async ({
  orderId, itemName, selectStatus, serviceRecipients, solutionPricesCount,
}) => getContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: [],
  selectStatus,
  solutionPricesCount,
});
