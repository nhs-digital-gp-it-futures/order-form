import { postData, putData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../helpers/controllers/manifestProvider';
import { extractDate } from '../../../../helpers/controllers/extractDate';

const formatFormData = ({ formData }) => ({
  'deliveryDate-day': formData['deliveryDate-day']
    ? formData['deliveryDate-day'].trim() : undefined,
  'deliveryDate-month': formData['deliveryDate-month']
    ? formData['deliveryDate-month'].trim() : undefined,
  'deliveryDate-year': formData['deliveryDate-year']
    ? formData['deliveryDate-year'].trim() : undefined,
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

const formatPostData = ({
  selectedRecipientId,
  serviceRecipientName,
  selectedSolutionId,
  solutionName,
  selectedPrice,
  formData,
}) => ({
  ...selectedPrice,
  serviceRecipient: {
    name: serviceRecipientName,
    odsCode: selectedRecipientId,
  },
  catalogueSolutionId: selectedSolutionId,
  catalogueSolutionName: solutionName,
  deliveryDate: extractDate('deliveryDate', formData),
  quantity: parseInt(formData.quantity, 10),
  estimationPeriod: formData.selectEstimationPeriod,
  price: parseFloat(formData.price),
});

const postSolutionOrderItem = async ({
  accessToken,
  orderId,
  selectedRecipientId,
  serviceRecipientName,
  selectedSolutionId,
  solutionName,
  selectedPrice,
  formData,
}) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'postSolutionOrderItem', options: { orderId } });
  const body = formatPostData({
    selectedRecipientId,
    serviceRecipientName,
    selectedSolutionId,
    solutionName,
    selectedPrice,
    formData,
  });

  await postData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item for ${solutionName} and ${serviceRecipientName} successfully created for order id: ${orderId}`);
  return { success: true };
};

const formatPutData = ({
  formData,
}) => ({
  deliveryDate: extractDate('deliveryDate', formData),
  quantity: parseInt(formData.quantity, 10),
  estimationPeriod: formData.selectEstimationPeriod,
  price: parseFloat(formData.price),
});

const putSolutionOrderItem = async ({
  accessToken,
  orderId,
  orderItemId,
  formData,
}) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'putCatalogueOrderItem', options: { orderId, orderItemId } });
  const body = formatPutData({
    formData,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order item successfully updated for order id: ${orderId} and order item id: ${orderItemId}`);
  return { success: true };
};

export const saveSolutionOrderItem = async ({
  orderId,
  orderItemId,
  accessToken,
  selectedRecipientId,
  serviceRecipientName,
  selectedSolutionId,
  solutionName,
  selectedPrice,
  formData,
}) => {
  try {
    const response = orderItemId === 'neworderitem'
      ? await postSolutionOrderItem({
        accessToken,
        orderId,
        selectedRecipientId,
        serviceRecipientName,
        selectedSolutionId,
        solutionName,
        selectedPrice,
        formData,
      })
      : await putSolutionOrderItem({
        accessToken,
        orderId,
        orderItemId,
        formData,
      });
    return response;
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      logger.info(`Follow validation errors returned from the API ${JSON.stringify(err.response.data.errors)}`);
      return err.response.data;
    }
    logger.error(`Error saving order item for ${solutionName} and ${serviceRecipientName} for order id: ${orderId}`);
    throw new Error();
  }
};