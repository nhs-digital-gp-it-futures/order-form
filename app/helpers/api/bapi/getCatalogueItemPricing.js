import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getCatalogueItemPricing = async ({ accessToken, catalogueItemId, loggerText = 'Catalogue item' }) => {
  const cataloguePricingEndpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getCatalogueItemPricing', options: { catalogueItemId } });
  const catalogueServicePricingData = await getData({
    endpoint: cataloguePricingEndpoint,
    accessToken,
    logger,
  });

  logger.info(`${loggerText} pricing for ${loggerText} with ID: ${catalogueItemId} found in BAPI.`);

  return catalogueServicePricingData;
};
