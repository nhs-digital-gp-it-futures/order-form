import { logger } from '../../logger';
import { postOrderItemBulk } from '../api/ordapi/postOrderItemBulk';

export const saveOrderItemBulk = async ({
  orderId,
  orderItemId,
  orderItemType,
  accessToken,
  serviceRecipientId,
  serviceRecipientName,
  itemId,
  itemName,
  selectedPrice,
  recipients,
  selectedRecipients,
  formData,
}) => {
  try {
    const recipientsList = selectedRecipients.map(
      (sr) => recipients.find((recipient) => recipient.odsCode === sr),
    );

    const response = orderItemId === 'neworderitem'
      ? await postOrderItemBulk({
        accessToken,
        orderId,
        orderItemType,
        serviceRecipientId,
        serviceRecipientName: recipientsList.map((r) => r.name),
        itemId,
        itemName,
        selectedPrice,
        recipients: recipientsList,
        formData,
      })
      : await postOrderItemBulk({
        orderItemId: Number(orderItemId),
        accessToken,
        orderId,
        orderItemType,
        serviceRecipientId,
        serviceRecipientName: recipientsList.map((r) => r.name),
        itemId,
        itemName,
        selectedPrice,
        recipients: recipientsList,
        formData,
      });
    return response;
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      logger.info(`Validation errors returned from the API ${JSON.stringify(err.response.data.errors)}`);
      return { success: false, errors: err.response.data.errors };
    }
    logger.error(`Error saving order item for ${itemName} and ${serviceRecipientName} for order id: ${orderId}`);
    throw new Error();
  }
};
