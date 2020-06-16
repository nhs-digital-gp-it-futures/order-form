import { getContext } from './contextCreator';
import { getSolution, getRecipients } from '../select/recipient/controller';

export const getOrderItemContext = async ({
  orderId,
  selectedSolutionId,
  selectedRecipientId,
  accessToken,
}) => {
  const solutionName = await getSolution({ solutionId: selectedSolutionId, accessToken }).name;
  const serviceRecipients = await getRecipients({ orderId, accessToken });

  const serviceRecipientName = serviceRecipients.find(
    recipient => recipient.odsCode === selectedRecipientId,
  ).name;

  return getContext({ solutionName, serviceRecipientName, odsCode: selectedRecipientId });
};
