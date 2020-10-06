import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import { extractDate } from '../../controllers/extractDate';

const formatPutData = data => ({
  deliveryDate: extractDate('deliveryDate', data),
});

const getPlannedDeliveryDateEndpoint = (orderId, catalogueItemId, priceId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/default-delivery-date/${catalogueItemId}/${priceId}/`
);

export const putPlannedDeliveryDate = async ({
  orderId, catalogueItemId, priceId, data, accessToken,
}) => {
  const endpoint = getPlannedDeliveryDateEndpoint(orderId, catalogueItemId, priceId);
  try {
    await putData({
      endpoint,
      body: formatPutData(data),
      accessToken,
      logger,
    });
    logger.info(`Planned delivery date updated - order id: ${orderId} catalogue-item-id: ${catalogueItemId}, ${JSON.stringify(data)}`);
    return { success: true };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error updating planned delivery date');
    throw new Error();
  }
};
