import { getContext } from './contextCreator';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';
import { putOrderSection } from '../../../../../helpers/api/ordapi/putOrderSection';

export const getAssociatedServicesPageContext = async ({ orderId, accessToken }) => {
  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
  });
};

export const putAssociatedServices = async ({ orderId, accessToken }) => {
  const result = await putOrderSection({
    orderId,
    sectionId: 'associated-services',
    accessToken,
  });

  return result;
};
