/* eslint-disable no-restricted-globals */
import { getData } from 'buying-catalogue-library';
import { postData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';

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

export const getOrderItemContext = async ({
  orderId,
  solutionName,
  selectedRecipientId,
  serviceRecipientName,
  selectedPrice,
}) => getContext({
  orderId, solutionName, serviceRecipientName, odsCode: selectedRecipientId, selectedPrice,
});

export const getOrderItemErrorPageContext = params => getErrorContext(params);

export const validateOrderItemForm = ({ data }) => {
  const errors = [];
  if (!data.quantity || data.quantity.trim().length <= 0) {
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

  if (!data.price || data.price.trim().length <= 0) {
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
  logger.info(`Retrieved solution data from BAPI for ${solutionId}`);

  return solutionData;
};

export const postSolution = async ({ orderId, accessToken, solution }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'postCatalogueSolution', options: { orderId } });
  const body = solution;
  try {
    const solutionData = await postData({ endpoint, body, accessToken, logger });
  }
  catch (err)
  {
    throw err;
  }
  return solutionData;
};

export const extractDeliveryDate = async (body) => {
  const day = body['plannedDeliveryDate-day'];
  const month = body['plannedDeliveryDate-month'];
  const year = body['plannedDeliveryDate-year'];
  return `${year}-${month.length === 1 ? '0' : ''}${month}-${day.length === 1 ? '0' : ''}${day}`;
};
