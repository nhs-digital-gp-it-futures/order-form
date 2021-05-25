import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';

export const getCatalogueSolutionsPageContext = async ({
  req,
  orderId,
  accessToken,
  sessionManager,
  logger,
  odsCode,
}) => {
  const catalogueItemType = 'Solution';
  const solutionOrderItemsData = await getOrderItems({ orderId, catalogueItemType, accessToken });
  const orderDescriptionData = await getOrderDescription({
    req,
    accessToken,
    sessionManager,
    logger,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData || '',
    orderItems: solutionOrderItemsData,
    odsCode,
  });
};
