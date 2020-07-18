import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';
import { putOrderSection } from '../../../../../helpers/api/ordapi/putOrderSection';

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

export const putCatalogueSolutions = async ({ orderId, accessToken }) => {
  const result = await putOrderSection({
    orderId,
    sectionId: 'catalogue-solutions',
    accessToken,
  });

  return result;
};
