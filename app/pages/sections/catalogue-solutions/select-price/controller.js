import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';

export const getSolutionPricePageContext = async ({
  orderId, supplierId, accessToken,
}) => {
  const solutionPricingEndpoint = getEndpoint({ endpointLocator: 'getSolutionPricing', options: { supplierId } });
  const solutionPricingData = await getData({
    endpoint: solutionPricingEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Solution pricing for supplier with id: ${supplierId} found in BAPI.`);

  return getContext({
    orderId,
    solutionPricingData,
  });
};
