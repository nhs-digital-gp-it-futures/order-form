import { getContext } from './contextCreator';

export const getSummaryPageContext = ({
  orderId, orderData, oneOffCostItems, recurringCostItems, odsCode,
}) => getContext({
  orderId, orderData, oneOffCostItems, recurringCostItems, odsCode,
});
