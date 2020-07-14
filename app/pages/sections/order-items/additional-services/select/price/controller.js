import { getData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../../../../endpoints';
import { logger } from '../../../../../../logger';

export const getAdditionalServicePricePageContext = params => getContext(params);

export const findAdditionalServicePrices = async ({ accessToken, catalogueItemId }) => {
  const additionalServicePricingEndpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getCatalogueItemPricing', options: { catalogueItemId } });
  const additionalServicePricingData = await getData({
    endpoint: additionalServicePricingEndpoint,
    accessToken,
    logger,
  });

  logger.info(`Additional service pricing for additional service with ID: ${catalogueItemId} found in BAPI.`);

  return additionalServicePricingData;
};
