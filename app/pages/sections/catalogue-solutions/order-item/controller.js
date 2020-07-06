/* eslint-disable no-restricted-globals */
import { getData, postData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from './manifestProvider';
import { getDateErrors } from '../../../../helpers/getDateErrors';
import { extractDate } from '../../../../helpers/extractDate';

const formatPostData = ({
  selectedRecipientId,
  serviceRecipientName,
  selectedSolutionId,
  solutionName,
  selectedPrice,
  detail,
}) => ({
  serviceRecipient: {
    name: serviceRecipientName,
    odsCode: selectedRecipientId,
  },
  catalogueSolutionId: selectedSolutionId,
  catalogueSolutionName: solutionName,
  deliveryDate: extractDate('deliveryDate', detail),
  quantity: parseInt(detail.quantity, 10),
  estimationPeriod: detail.selectEstimationPeriod,
  provisioningType: selectedPrice.provisioningType,
  type: selectedPrice.type,
  currencyCode: 'GBP',
  itemUnitModel: selectedPrice.itemUnit,
  price: parseFloat(detail.price),
});

export const getOrderItem = async ({ orderId, orderItemId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getCatalogueOrderItem', options: { orderId, orderItemId } });
  const catalogueOrderItem = await getData({ endpoint, accessToken, logger });
  logger.info(`Catalogue order item returned for ${orderItemId}`);

  return catalogueOrderItem;
};

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

  const populatedData = formData !== undefined ? formData : { price: selectedPrice.price };

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

export const validateOrderItemForm = ({ data, selectedPrice }) => {
  const errors = [];
  const selectedPriceManifest = getSelectedPriceManifest({
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  if (selectedPriceManifest.questions.deliveryDate) {
    const deliveryDateError = getDateErrors('deliveryDate', data);
    if (deliveryDateError) {
      errors.push(deliveryDateError);
    }
  }

  if (selectedPriceManifest.questions.quantity) {
    if (!data.quantity || data.quantity.trim().length === 0) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityRequired',
      });
    } else if (isNaN(data.quantity)) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityMustBeANumber',
      });
    } else if (data.quantity.indexOf('.') !== -1) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityInvalid',
      });
    }
  }

  if (selectedPriceManifest.questions.selectEstimationPeriod) {
    if (!data.selectEstimationPeriod) {
      errors.push({
        field: 'SelectEstimationPeriod',
        id: 'EstimationPeriodRequired',
      });
    }
  }

  if (selectedPriceManifest.addPriceTable.cellInfo.price.question) {
    if (!data.price || data.price.trim().length === 0) {
      errors.push({
        field: 'Price',
        id: 'PriceRequired',
      });
    } else if (isNaN(data.price)) {
      errors.push({
        field: 'Price',
        id: 'PriceMustBeANumber',
      });
    } else if (data.price.split('.')[1].length > 3) {
      errors.push({
        field: 'Price',
        id: 'PriceMoreThan3dp',
      });
    }
  }

  if (errors.length === 0) {
    return { success: true };
  }
  return { success: false, errors };
};

export const getSolution = async ({ solutionId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getSolution', options: { solutionId } });
  const solutionData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrieved solution data from BAPI for ${solutionId}`);

  return solutionData;
};

export const postSolutionOrderItem = async ({
  orderId,
  accessToken,
  selectedRecipientId,
  serviceRecipientName,
  selectedSolutionId,
  solutionName,
  selectedPrice,
  detail,
}) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'postSolutionOrderItem', options: { orderId } });
  const body = formatPostData({
    selectedRecipientId,
    serviceRecipientName,
    selectedSolutionId,
    solutionName,
    selectedPrice,
    detail,
  });
  await postData({
    endpoint, body, accessToken, logger,
  });
};
