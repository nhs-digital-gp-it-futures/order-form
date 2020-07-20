import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

export const getCatalogueSolutionsPageContext = async ({ orderId, accessToken }) => {
  const catalogueItemType = 'Solution';
  const solutionOrderItemsData = await getOrderItems({ orderId, catalogueItemType, accessToken });
  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
    orderItems: solutionOrderItemsData,
  });
};
