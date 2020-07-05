/* eslint-disable no-restricted-globals */
import { getData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from './manifestProvider';
import { getDateErrors } from '../../../../helpers/getDateErrors';

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

const formatFormData = ({ formData }) => ({
  'plannedDeliveryDate-day': formData['plannedDeliveryDate-day']
    ? formData['plannedDeliveryDate-day'].trim() : undefined,
  'plannedDeliveryDate-month': formData['plannedDeliveryDate-month']
    ? formData['plannedDeliveryDate-month'].trim() : undefined,
  'plannedDeliveryDate-year': formData['plannedDeliveryDate-year']
    ? formData['plannedDeliveryDate-year'].trim() : undefined,
  quantity: formData.quantity
    ? formData.quantity.trim() : undefined,
  price: formData.price && formData.price.length > 0
    ? formData.price.trim() : undefined,
  selectEstimationPeriod: formData.selectEstimationPeriod
    ? formData.selectEstimationPeriod.trim() : undefined,
});

export const getOrderItemContext = async ({
  orderId,
  solutionName,
  selectedRecipientId,
  serviceRecipientName,
  selectedPrice,
}) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  const populatedData = {
    price: selectedPrice.price,
  };

  return getContext({
    commonManifest,
    selectedPriceManifest,
    orderId,
    solutionName,
    serviceRecipientName,
    odsCode: selectedRecipientId,
    selectedPrice,
    formData: populatedData,
  });
};

export const getOrderItemErrorPageContext = (params) => {
  const formattedData = formatFormData({
    formData: params.formData,
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
  const plannedDeliverDateError = getDateErrors('plannedDeliveryDate', data);
  if (plannedDeliverDateError) {
    errors.push(plannedDeliverDateError);
  }

  if (!data.quantity || data.quantity.trim().length === 0) {
    errors.push({
      field: 'Quantity',
      id: 'QuantityRequired',
    });
  } else if (isNaN(data.quantity)) {
    errors.push({
      field: 'Quantity',
      id: 'NumericQuantityRequired',
    });
  }

  if (!data.selectEstimationPeriod) {
    errors.push({
      field: 'SelectEstimationPeriod',
      id: 'EstimationPeriodRequired',
    });
  }

  if (!data.price || data.price.trim().length === 0) {
    errors.push({
      field: 'Price',
      id: 'PriceRequired',
    });
  } else if (isNaN(data.price)) {
    errors.push({
      field: 'Price',
      id: 'NumericPriceRequired',
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
