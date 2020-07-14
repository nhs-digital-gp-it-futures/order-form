import { getData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { getEndpoint } from '../../../../../../endpoints';
import { logger } from '../../../../../../logger';

export const getSolutionPricePageContext = params => getContext(params);

export const findSolutionPrices = async ({ accessToken, solutionId }) => {
  const solutionPricingEndpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getSolutionPricing', options: { solutionId } });
  const solutionPricingData = await getData({
    endpoint: solutionPricingEndpoint,
    accessToken,
    logger,
  });

  logger.info(`Solution pricing for solution with id: ${solutionId} found in BAPI.`);

  return solutionPricingData;
};

export const getSolutionPriceErrorPageContext = params => getErrorContext(params);

export const validateSolutionPriceForm = ({ data }) => {
  if (data.selectSolutionPrice && data.selectSolutionPrice.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectSolutionPrice',
      id: 'SelectSolutionPriceRequired',
    },
  ];
  return { success: false, errors };
};
