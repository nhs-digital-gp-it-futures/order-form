import { getContext } from './contextCreator';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

export const getAssociatedServicesPageContext = async ({ orderId, accessToken }) => {
  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
  });
};
