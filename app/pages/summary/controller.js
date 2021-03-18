import { getContext } from './contextCreator';

export const getSummaryPageContext = ({
  orderId, orderData, oneOffCostItems, recurringCostItems,
}) => getContext({
  orderId, orderData, oneOffCostItems, recurringCostItems,
});
