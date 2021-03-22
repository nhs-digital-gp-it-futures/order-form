import { logger } from '../../logger';
import { putOrderItem } from '../api/ordapi/putOrderItem';

export const saveOrderItem = async ({
  orderId,
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
    const response = await putOrderItem({
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
