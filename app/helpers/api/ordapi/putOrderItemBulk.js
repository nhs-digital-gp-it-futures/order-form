import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { extractDate } from '../../controllers/extractDate';
import { orderApiUrl } from '../../../config';

const formatPutData = ({
  formData,
}) => ({
  deliveryDate: extractDate('deliveryDate', formData),
  quantity: parseInt(formData.quantity, 10),
  estimationPeriod: formData.selectEstimationPeriod,
  price: parseFloat(formData.price),
});

const getPutOrderItemEndpoint = orderId => `${orderApiUrl}/api/v1/orders/${orderId}/order-items/batch`;

export const putOrderItem = async ({
  accessToken,
  orderId,
  orderItemId,
  formData,
}) => {
  const endpoint = getPutOrderItemEndpoint(orderId);
  const body = formatPutData({
    formData,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item successfully updated for order id: ${orderId} and order item id: ${orderItemId}`);
  return { success: true };
};
