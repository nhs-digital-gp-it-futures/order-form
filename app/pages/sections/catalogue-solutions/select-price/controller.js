import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';

export const getsolutionPricePageContext = async ({
  orderId, supplierId, accessToken,
}) => {
  const solutionPricingEndpoint = getEndpoint({ endpointLocator: 'getsolutionPricing', options: { supplierId } });
  const solutionPricingData = await getData({
    endpoint: solutionPricingEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Solutions pricing for supplier with id: ${supplierId} found in OAPI.`);

  return getContext({
    orderId,
    solutionPricingData,
  });
};
