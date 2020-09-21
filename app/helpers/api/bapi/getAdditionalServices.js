import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getAdditionalServicesEndpoint = (addedCatalogueSolutions) => {
  const queryString = `solutionIds=${addedCatalogueSolutions.join('&solutionIds=')}`;
  return `${solutionsApiUrl}/api/v1/additional-services?${queryString}`;
};

export const getAdditionalServices = async ({ addedCatalogueSolutions, accessToken }) => {
  const endpoint = getAdditionalServicesEndpoint(addedCatalogueSolutions);
  const { additionalServices } = await getData({ endpoint, accessToken, logger });
  if (!additionalServices) {
    return [];
  }

  logger.info(`Found ${additionalServices.length} additional service(s).`);
  return additionalServices;
};
