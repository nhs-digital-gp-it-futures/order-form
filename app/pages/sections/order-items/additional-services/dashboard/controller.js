import { putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';
import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

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
  const putAdditionalServicesEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'putAdditionalServices', options: { orderId } });
  try {
    const body = {
      status: 'complete',
    };

    await putData({
      endpoint: putAdditionalServicesEndpoint,
      body,
      accessToken,
      logger,
    });
    return { success: true };
  } catch (err) {
    logger.error(`Error updating additional-services for ${orderId}`);
    throw new Error();
  }
};
