import { getContext } from './contextCreator';

export const getSummaryPageContext = ({
  orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
}) => getContext({
  orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
});
