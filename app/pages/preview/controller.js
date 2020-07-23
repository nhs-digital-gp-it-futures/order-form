import { getContext } from './contextCreator';
import { createServiceRecipientsDict } from './helpers/createServiceRecipientsDict';
import { transformOrderItems } from './helpers/transformOrderItems';

export const getPreviewPageContext = ({ orderId, orderData }) => {
  const serviceRecipients = createServiceRecipientsDict(orderData.serviceRecipients);
  const { recurringCostItems, oneOffCostItems } = transformOrderItems(orderData.orderItems);

  return getContext({
    orderId, orderData, oneOffCostItems, recurringCostItems, serviceRecipients,
  });
};
