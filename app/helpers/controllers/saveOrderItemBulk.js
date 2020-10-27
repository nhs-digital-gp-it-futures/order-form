import { logger } from '../../logger';
import { postOrderItemBulk } from '../api/ordapi/postOrderItemBulk';
import { putOrderItem } from '../api/ordapi/putOrderItem';

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
    const response = orderItemId === 'neworderitem'
      ? await postOrderItemBulk({
        accessToken,
        orderId,
        orderItemType,
        serviceRecipientId,
        serviceRecipientName,
        itemId,
        itemName,
        selectedPrice,
        recipients: selectedRecipients.map(
          selectedRecipient => recipients
            .find(recipient => recipient.odsCode === selectedRecipient),
        ),
        formData,
      })
      : await putOrderItem({
        accessToken,
        orderId,
        orderItemId,
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
