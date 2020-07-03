/* eslint-disable no-restricted-globals */
import { getData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from './manifestProvider';

export const getRecipientName = async ({ selectedRecipientId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'oapi', endpointLocator: 'getServiceRecipient', options: { selectedRecipientId } });
  const serviceRecipientData = await getData({ endpoint, accessToken, logger });
  logger.info(`service recipient returned for ${selectedRecipientId}`);

  return serviceRecipientData.name;
};

export const getSelectedPrice = async ({ selectedPriceId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getSelectedPrice', options: { selectedPriceId } });
  const selectedPriceData = await getData({ endpoint, accessToken, logger });
  logger.info(`Price details returned for ${selectedPriceId}`);

  return selectedPriceData;
};

const formatFormData = ({ formData, selectedPrice }) => ({
  ...selectedPrice,
  plannedDeliveryDate: formData.plannedDeliveryDate ? formData.plannedDeliveryDate.trim() : null,
  quantity: formData.quantity ? formData.quantity.trim() : null,
  price: formData.price && formData.price.length > 0 ? formData.price.trim() : selectedPrice.price,
  selectEstimationPeriod: formData.selectEstimationPeriod ? formData.selectEstimationPeriod.trim() : null,
});

export const getOrderItemContext = async ({
  orderId,
  solutionName,
  selectedRecipientId,
  serviceRecipientName,
  selectedPrice,
  formData,
}) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  const formattedData = formatFormData({ formData, selectedPrice });

  return getContext({
    commonManifest,
    selectedPriceManifest,
    orderId,
    solutionName,
    serviceRecipientName,
    odsCode: selectedRecipientId,
    selectedPrice,
    formData: formattedData,
  });
};

export const getOrderItemErrorPageContext = (params) => {
  console.log('formData', JSON.stringify(params.formData, null, 2))
  const formattedData = formatFormData({
    formData: params.formData, selectedPrice: params.selectedPrice,
  });

  const selectedPriceManifest = getSelectedPriceManifest({
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

export const validateOrderItemForm = ({ data }) => {
  const errors = [];
  if (!data.quantity || data.quantity.trim().length === 0) {
    errors.push({
      field: 'quantity',
      id: 'quantityRequired',
    });
  } else if (isNaN(data.quantity)) {
    errors.push({
      field: 'quantity',
      id: 'numericQuantityRequired',
    });
  }

  if (!data.selectEstimationPeriod) {
    errors.push({
      field: 'selectEstimationPeriod',
      id: 'estimationPeriodRequired',
    });
  }

  if (!data.price || data.price.trim().length === 0) {
    errors.push({
      field: 'price',
      id: 'priceRequired',
    });
  } else if (isNaN(data.price)) {
    errors.push({
      field: 'price',
      id: 'numericPriceRequired',
    });
  }

  if (errors.length === 0) {
    return { success: true };
  }
  return { success: false, errors };
};

export const getSolution = async ({ solutionId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getSolution', options: { solutionId } });
  const solutionData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrived solution data from BAPI for ${solutionId}`);

  return solutionData;
};
