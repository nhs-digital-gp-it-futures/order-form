import { logger } from '../../logger';
import { postOrderItem } from '../api/ordapi/postOrderItem';
import { putOrderItem } from '../api/ordapi/putOrderItem';

export const saveOrderItem = async ({
  orderId,
  orderItemId,
  orderItemType,
  accessToken,
  serviceRecipientId,
  serviceRecipientName,
  itemId,
  itemName,
  catalogueSolutionId,
  selectedPrice,
  formData,
}) => {
  try {
    const response = orderItemId === 'neworderitem'
      ? await postOrderItem({
        accessToken,
        orderId,
        orderItemType,
        serviceRecipientId,
        serviceRecipientName,
        itemId,
        itemName,
        catalogueSolutionId,
        selectedPrice,
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
