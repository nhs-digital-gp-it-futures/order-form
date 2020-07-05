import { getData, putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const getAdditionalServicesPageContext = async ({ orderId, accessToken }) => {
  const getAddedAdditionalServicesDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getAddedAdditionalServices', options: { orderId } });
  const addedAdditionalServicesData = await getData({
    endpoint: getAddedAdditionalServicesDataEndpoint, accessToken, logger,
  });

  const getOrderDescriptionDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getDescription', options: { orderId } });
  const orderDescriptionData = await getData({
    endpoint: getOrderDescriptionDataEndpoint, accessToken, logger,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
    orderItems: addedAdditionalServicesData.orderItems,
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
