import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';


export const getAdditionalServicesPageContext = async ({ orderId, accessToken }) => {
  const getAddedAdditionalServicesDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getAddedAdditionalServices', options: { orderId } });
  const addedAdditionalServicesData = await getData({
    endpoint: getAddedAdditionalServicesDataEndpoint, accessToken, logger,
  });

  return getContext({
    orderId,
    orderDescription: addedAdditionalServicesData.orderDescription,
    orderItems: addedAdditionalServicesData.orderItems,
  });
};
