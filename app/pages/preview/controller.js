import { getContext } from './contextCreator';

export const getPreviewPageContext = ({
  orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
}) => getContext({
  orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
});
