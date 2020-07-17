import { getData, putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';
import { getContext } from './contextCreator';

export const getAssociatedServicesPageContext = async ({ orderId, accessToken }) => {
  const getOrderDescriptionDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getDescription', options: { orderId } });
  const orderDescriptionData = await getData({
    endpoint: getOrderDescriptionDataEndpoint, accessToken, logger,
  });

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
