import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';

export const getAssociatedServicesPageContext = async ({
  req,
  orderId,
  catalogueItemType,
  accessToken,
  sessionManager,
  logger,
  odsCode,
}) => {
  const orderDescriptionData = await getOrderDescription({
    req,
    accessToken,
    sessionManager,
    logger,
  });

  const associatedServiceOrderItemsData = await getOrderItems({
    orderId,
    catalogueItemType,
    accessToken,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData || '',
    orderItems: associatedServiceOrderItemsData,
    odsCode,
  });
};
