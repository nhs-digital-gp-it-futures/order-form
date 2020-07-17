import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

export const getCatalogueItemPricingEndpoint = ({ catalogueItemId }) => (
  `${solutionsApiUrl}/api/v1/prices?catalogueItemId=${catalogueItemId}`
);

export const getCatalogueItemPricing = async ({ accessToken, catalogueItemId, loggerText = 'Catalogue item' }) => {
  const cataloguePricingEndpoint = getCatalogueItemPricingEndpoint({ catalogueItemId });
  const catalogueServicePricingData = await getData({
    endpoint: cataloguePricingEndpoint,
    accessToken,
    logger,
  });

  logger.info(`${loggerText} pricing for ${loggerText} with ID: ${catalogueItemId} found in BAPI.`);

  return catalogueServicePricingData;
};
