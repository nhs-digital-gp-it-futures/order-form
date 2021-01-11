import { postData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { extractDate } from '../../controllers/extractDate';
import { orderApiUrl } from '../../../config';

const formatPostData = ({
  orderItemId,
  orderItemType,
  itemId,
  itemName,
  selectedPrice,
  recipients,
  formData,
}) => recipients.map((recipient, index) => ({
  ...selectedPrice,
  orderItemId,
  serviceRecipient: {
    name: recipient.name,
    odsCode: recipient.odsCode,
  },
  catalogueItemId: itemId,
  catalogueItemName: itemName,
  catalogueItemType: orderItemType,
  deliveryDate: extractDate('deliveryDate', formData.deliveryDate, index),
  quantity: parseInt(formData.quantity[index], 10),
  estimationPeriod: selectedPrice.timeUnit.name,
  price: parseFloat(formData.price),
}));

const getPostOrderItemEndpoint = (orderId) => `${orderApiUrl}/api/v1/orders/${orderId}/order-items/batch`;

export const postOrderItemBulk = async ({
  orderItemId,
  accessToken,
  orderId,
  orderItemType,
  itemName,
  itemId,
  selectedPrice,
  recipients,
  formData,
}) => {
  const endpoint = getPostOrderItemEndpoint(orderId);
  const body = formatPostData({
    orderItemId,
    orderItemType,
    itemId,
    itemName,
    selectedPrice,
    recipients,
    formData,
  });

  await postData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item for ${itemName} successfully created for order id: ${orderId}`);
  return { success: true };
};
