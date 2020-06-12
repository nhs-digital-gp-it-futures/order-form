import { getContext } from './contextCreator';
import { getSolution } from '../select/recipient/controller';

export const getOrderItemContext = async ({
  orderId,
  orderItemId,
  selectedSolutionId,
  selectedRecipientId,
  accessToken,
}) => {
  const solutionName = await getSolution({ solutionId: selectedSolutionId, accessToken })
  let serviceRecipientName;
  let odsCode;

  return getContext({ solutionName, serviceRecipientName, odsCode });
};
