import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';

export const getSolutionsPricePageContext = async ({
  orderId, supplierId, accessToken,
}) => {
  const solutionsPricingEndpoint = getEndpoint({ endpointLocator: 'getSolutionsPricing', options: { supplierId } });
  const solutionsPricingData = await getData({
    endpoint: solutionsPricingEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Solutions pricing for supplier with id: ${supplierId} found in OAPI.`);

  return getContext({
    orderId,
    solutionsPricingData,
  });
};
