import { logger } from '../../../../../../logger';
import { getContext, getErrorContext } from './contextCreator';
import { getOrderItems } from '../../../../../../helpers/api/ordapi/getOrderItems';

export const getAdditionalServicePageContext = params => getContext(params);
export const getAdditionalServiceErrorPageContext = params => getErrorContext(params);

export const findAddedCatalogueSolutions = async ({ orderId, accessToken }) => {
  const catalogueSolutions = await getOrderItems({ orderId, catalogueItemType: 'Solution', accessToken });
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
