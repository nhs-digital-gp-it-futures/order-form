import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';
import { putOrderSection } from '../../../../../helpers/api/ordapi/putOrderSection';

export const getAdditionalServicesPageContext = async ({
  orderId,
  catalogueItemType,
  accessToken,
}) => {
  const additionalServiceOrderItemsData = await getOrderItems({
    orderId,
    catalogueItemType,
    accessToken,
  });

  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
    orderItems: additionalServiceOrderItemsData,
  });
};

export const putAdditionalServices = async ({ orderId, accessToken }) => {
  const result = await putOrderSection({
    orderId,
    sectionId: 'additional-services',
    accessToken,
  });

  return result;
};
