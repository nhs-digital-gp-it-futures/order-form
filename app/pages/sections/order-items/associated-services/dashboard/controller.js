import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

export const getAssociatedServicesPageContext = async ({
  orderId,
  catalogueItemType,
  accessToken,
}) => {
  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  const associatedServiceOrderItemsData = await getOrderItems({
    orderId,
    catalogueItemType,
    accessToken,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
    orderItems: associatedServiceOrderItemsData,
  });
};
