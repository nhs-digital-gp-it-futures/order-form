import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';

export const getSolutionPricePageContext = async ({
  orderId, accessToken, solutionId,
}) => {
  const solutionPricingEndpoint = getEndpoint({ endpointLocator: 'getSolutionPricing', options: { solutionId } });
  const solutionPricingData = await getData({
    endpoint: solutionPricingEndpoint,
    accessToken,
    logger,
  });

  logger.info(`Solution pricing for solution with id: ${solutionId} found in BAPI.`);

  return getContext({
    orderId,
    solutionPricingData,
  });
};
