import { getContext } from './contextCreator';
import { getSolution } from '../select/recipient/controller';

export const getOrderItemContext = async ({
  selectedSolutionId,
  selectedRecipientId,
  recipients,
  accessToken,
}) => {
  const solutionName = await getSolution({ solutionId: selectedSolutionId, accessToken }).name;
  const serviceRecipientName = recipients.find(
    recipient => recipient.odsCode === selectedRecipientId,
  ).name;
  return getContext({ solutionName, serviceRecipientName, odsCode: selectedRecipientId });
};
