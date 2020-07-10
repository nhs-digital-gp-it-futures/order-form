import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';

export const findAdditionalServicePrices = async ({ accessToken, additionalServiceId }) => {
  const additionalServicePricingEndpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getAdditionalServicePricing', options: { additionalServiceId } });
  const additionalServicePricingData = await getData({
    endpoint: additionalServicePricingEndpoint,
    accessToken,
    logger,
  });

  logger.info(`Additional service pricing for additional service with ID: ${additionalServiceId} found in BAPI.`);

  return additionalServicePricingData;
};
