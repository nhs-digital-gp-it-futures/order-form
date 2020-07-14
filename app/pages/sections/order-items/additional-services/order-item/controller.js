import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../../logger';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../helpers/controllers/manifestProvider';
import { postOrderItem } from '../../../../../helpers/api/ordapi/postOrderItem';
import { putOrderItem } from '../../../../../helpers/api/ordapi/putOrderItem';

const formatFormData = ({ formData }) => ({
  quantity: formData.quantity
    ? formData.quantity.trim() : undefined,
  price: formData.price && formData.price.length > 0
    ? formData.price.trim() : undefined,
  selectEstimationPeriod: formData.selectEstimationPeriod
    ? formData.selectEstimationPeriod.trim() : undefined,
});

export const getOrderItemContext = async ({
  orderId,
  orderItemId,
  orderItemType,
  itemName,
  odsCode,
  serviceRecipientName,
  selectedPrice,
  formData,
}) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType,
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  return getContext({
    commonManifest,
    selectedPriceManifest,
    orderId,
    orderItemId,
    itemName,
    serviceRecipientName,
    odsCode,
    selectedPrice,
    formData,
  });
};

export const getOrderItemErrorPageContext = (params) => {
  const formattedData = formatFormData({
    formData: params.formData,
  });

  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType: params.orderItemType,
    provisioningType: params.selectedPrice.provisioningType,
    type: params.selectedPrice.type,
  });

  const updatedParams = {
    ...params,
    commonManifest,
    selectedPriceManifest,
    formData: formattedData,
  };

  return getErrorContext(updatedParams);
};

export const saveOrderItem = async ({
  orderId,
  orderItemId,
  accessToken,
  serviceRecipientId,
  serviceRecipientName,
  itemId,
  itemName,
  selectedPrice,
  formData,
}) => {
  try {
    const response = orderItemId === 'neworderitem'
      ? await postOrderItem({
        accessToken,
        orderId,
        serviceRecipientId,
        serviceRecipientName,
        itemId,
        itemName,
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
      return err.response.data;
    }
    logger.error(`Error saving order item for ${itemName} and ${serviceRecipientName} for order id: ${orderId}`);
    throw new Error();
  }
};
