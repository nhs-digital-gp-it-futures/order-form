import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';

export const getAdditionalServicesPageContext = async ({
  req,
  orderId,
  catalogueItemType,
  accessToken,
  sessionManager,
  logger,
}) => {
  const additionalServiceOrderItemsData = await getOrderItems({
    orderId,
    catalogueItemType,
    accessToken,
  });

  const orderDescriptionData = await getOrderDescription({
    req,
    sessionManager,
    accessToken,
    logger,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData || '',
    orderItems: additionalServiceOrderItemsData,
  });
};
