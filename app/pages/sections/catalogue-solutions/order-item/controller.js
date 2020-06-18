import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
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
  selectedSolutionId,
  selectedRecipientId,
  selectedPriceId,
  accessToken,
}) => {
  const solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
  const serviceRecipientName = await getRecipientName({ selectedRecipientId, accessToken });
  const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });

  return getContext({
    orderId, solutionName, serviceRecipientName, odsCode: selectedRecipientId, selectedPrice,
  });
};
