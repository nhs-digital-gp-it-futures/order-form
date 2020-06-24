import { getData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../../logger';
import { getEndpoint } from '../../../../endpoints';
import { getSolution } from '../select/recipient/controller';

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
  if (data.quantity && data.selectSolutionPrice.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'quantity',
      id: 'quantityRequired',
    },
  ];
  return { success: false, errors };
};
