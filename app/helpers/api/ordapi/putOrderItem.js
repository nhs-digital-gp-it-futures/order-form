import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { extractDate } from '../../controllers/extractDate';
import { orderApiUrl } from '../../../config';

const formatPutData = ({
  orderItemType,
  serviceRecipientId,
  serviceRecipientName,
  itemName,
  catalogueSolutionId,
  selectedPrice,
  formData,
}) => ({
  ...selectedPrice,
  serviceRecipients: [serviceRecipientName || serviceRecipientId
    ? {
      deliveryDate: extractDate('deliveryDate', formData),
      name: serviceRecipientName,
      odsCode: serviceRecipientId,
      quantity: parseInt(formData.quantity, 10),
    }
    : {
      quantity: parseInt(formData.quantity, 10),
    }],
  catalogueItemName: itemName,
  catalogueItemType: orderItemType,
  catalogueSolutionId,
  estimationPeriod: formData.selectEstimationPeriod,
  price: parseFloat(formData.price),
});

const getPutOrderItemEndpoint = (callOffId, catalogueItemId) => `${orderApiUrl}/api/v1/orders/${callOffId}/order-items/${catalogueItemId}`;

export const putOrderItem = async ({
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
  const endpoint = getPutOrderItemEndpoint(orderId, itemId);

  const body = formatPutData({
    orderItemType,
    serviceRecipientId,
    serviceRecipientName,
    itemName,
    catalogueSolutionId,
    selectedPrice,
    formData,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item for ${itemName} and ${serviceRecipientName} successfully created for order with call-off ID: ${orderId}`);
  return { success: true };
};
