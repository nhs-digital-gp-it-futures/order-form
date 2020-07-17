import { getContext } from './contextCreator';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

export const getAssociatedServicesPageContext = async ({ orderId, accessToken }) => {
  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
  });
};

export const putAssociatedServices = async ({ orderId, accessToken }) => {
  const putAssociatedServicesEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'putAssociatedServices', options: { orderId } });
  try {
    const body = {
      status: 'complete',
    };

    await putData({
      endpoint: putAssociatedServicesEndpoint,
      body,
      accessToken,
      logger,
    });
    return { success: true };
  } catch (err) {
    logger.error(`Error updating associated-services for ${orderId}`);
    throw new Error();
  }
};
