import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { extractDate } from '../../controllers/extractDate';
import { orderApiUrl } from '../../../config';
import { formatPrice } from '../../common/priceFormatter';

const formatPutData = ({
  formData,
}) => ({
  deliveryDate: extractDate('deliveryDate', formData),
  quantity: parseInt(formData.quantity, 10),
  estimationPeriod: formData.selectEstimationPeriod,
  price: formatPrice(formData.price),
});

const getPutOrderItemEndpoint = (orderId, orderItemId) => `${orderApiUrl}/api/v1/orders/${orderId}/order-items/${orderItemId}`;

export const putOrderItem = async ({
  accessToken,
  orderId,
  orderItemId,
  formData,
}) => {
  const endpoint = getPutOrderItemEndpoint(orderId, orderItemId);
  const body = formatPutData({
    formData,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item successfully updated for order id: ${orderId} and order item id: ${orderItemId}`);
  return { success: true };
};
