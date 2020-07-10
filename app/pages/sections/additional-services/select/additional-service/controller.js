import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';
import { getContext, getErrorContext } from './contextCreator';

export const getAdditionalServicePageContext = params => getContext(params);
export const getAdditionalServiceErrorPageContext = params => getErrorContext(params);

export const findAdditionalServices = async ({ addedCatalogueSolutions, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getAdditionalServices', options: { addedCatalogueSolutions } });
  const { additionalServices } = await getData({ endpoint, accessToken, logger });
  if (!additionalServices) {
    return [];
  }

  logger.info(`Found ${additionalServices.length} additional service(s).`);
  return additionalServices;
};

export const findAddedCatalogueSolutions = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getAddedCatalogueSolutions', options: { orderId } });
  const { catalogueSolutions } = await getData({ endpoint, accessToken, logger });
  if (!catalogueSolutions) {
    return [];
  }

  logger.info(`Found ${catalogueSolutions.length} catalogue solution(s) for Order with ID '${orderId}'.`);
  return catalogueSolutions.map(catalogueSolution => catalogueSolution.catalogueItemId);
};

export const validateAdditionalServicesForm = ({ data }) => {
  if (data.selectAdditionalService && data.selectAdditionalService.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectAdditionalService',
      id: 'SelectAdditionalServiceRequired',
    },
  ];

  return { success: false, errors };
};
