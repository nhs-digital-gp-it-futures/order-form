import { postData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { getEndpoint } from '../../../endpoints';
import { extractDate } from '../../controllers/extractDate';

const formatPostData = ({
  orderItemType,
  serviceRecipientId,
  serviceRecipientName,
  itemId,
  itemName,
  selectedPrice,
  formData,
}) => ({
  ...selectedPrice,
  serviceRecipient: {
    name: serviceRecipientName,
    odsCode: serviceRecipientId,
  },
  catalogueItemId: itemId,
  catalogueItemName: itemName,
  catalogueItemType: orderItemType,
  deliveryDate: extractDate('deliveryDate', formData),
  quantity: parseInt(formData.quantity, 10),
  estimationPeriod: formData.selectEstimationPeriod,
  price: parseFloat(formData.price),
});

export const postOrderItem = async ({
  accessToken,
  orderId,
  orderItemType,
  serviceRecipientId,
  serviceRecipientName,
  itemId,
  itemName,
  selectedPrice,
  formData,
}) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'postOrderItem', options: { orderId } });
  const body = formatPostData({
    orderItemType,
    serviceRecipientId,
    serviceRecipientName,
    itemId,
    itemName,
    selectedPrice,
    formData,
  });

  await postData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item for ${itemName} and ${serviceRecipientName} successfully created for order id: ${orderId}`);
  return { success: true };
};
