import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getSelectedPriceEndpoint = selectedPriceId => (
  `${solutionsApiUrl}/api/v1/prices/${selectedPriceId}`
);

export const getSelectedPrice = async ({ selectedPriceId, accessToken }) => {
  const endpoint = getSelectedPriceEndpoint(selectedPriceId);
  const selectedPriceData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrieved Price data from BAPI for ${selectedPriceId}`);

  return selectedPriceData;
};
