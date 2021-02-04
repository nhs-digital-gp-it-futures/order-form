import { postData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { extractDate } from '../../controllers/extractDate';
import { orderApiUrl } from '../../../config';
import { formatPrice } from '../../common/priceFormatter';

const formatPostData = ({
  orderItemType,
  serviceRecipientId,
  serviceRecipientName,
  itemId,
  itemName,
  catalogueSolutionId,
  selectedPrice,
  formData,
}) => ({
  ...selectedPrice,
  serviceRecipient: serviceRecipientName || serviceRecipientId ? {
    name: serviceRecipientName,
    odsCode: serviceRecipientId,
  } : undefined,
  catalogueItemId: itemId,
  catalogueItemName: itemName,
  catalogueItemType: orderItemType,
  catalogueSolutionId,
  deliveryDate: extractDate('deliveryDate', formData),
  quantity: parseInt(formData.quantity, 10),
  estimationPeriod: formData.selectEstimationPeriod,
  price: formatPrice(formData.price),
});

const getPostOrderItemEndpoint = (orderId) => `${orderApiUrl}/api/v1/orders/${orderId}/order-items`;

export const postOrderItem = async ({
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
}) => {
  const endpoint = getPostOrderItemEndpoint(orderId);
  const body = formatPostData({
    orderItemType,
    serviceRecipientId,
    serviceRecipientName,
    itemId,
    itemName,
    catalogueSolutionId,
    selectedPrice,
    formData,
  });

  await postData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item for ${itemName} and ${serviceRecipientName} successfully created for order id: ${orderId}`);
  return { success: true };
};
