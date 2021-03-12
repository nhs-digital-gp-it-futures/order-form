import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { extractDate } from '../../controllers/extractDate';
import { orderApiUrl } from '../../../config';

const formatPostData = ({
  orderItemId,
  orderItemType,
  catalogueItemId,
  itemName,
  selectedPrice,
  recipients,
  formData,
}) => ({
  catalogueItemId,
  catalogueItemName: itemName,
  catalogueItemType: orderItemType,
  currencyCode: 'GBP',
  estimationPeriod: selectedPrice.timeUnit ? selectedPrice.timeUnit.name : null,
  price: parseFloat(formData.price),
  ...selectedPrice,
  orderItemId,
  serviceRecipients: recipients.map((recipient, index) => ({
    name: recipient.name,
    odsCode: recipient.odsCode,
    quantity: parseInt(formData.quantity[index], 10),
    deliveryDate: extractDate('deliveryDate', formData.deliveryDate, index),
  })),
});

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
  const endpoint = `${orderApiUrl}/api/v1/orders/${orderId}/order-items/${itemId}`;

  const body = formatPostData({
    orderItemId,
    orderItemType,
    catalogueItemId: itemId,
    itemName,
    selectedPrice,
    recipients,
    formData,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });

  logger.info(`Order item for ${itemName} successfully created for order id: ${orderId}, Catelogue item id: ${itemId}`);
  return { success: true };
};
