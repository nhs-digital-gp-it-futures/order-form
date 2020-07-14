import { getData, putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';
import { getContext } from './contextCreator';

export const getCatalogueSolutionsPageContext = async ({ orderId, accessToken }) => {
  const getAddedSolutionsDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getAddedCatalogueSolutions', options: { orderId } });
  const addedSolutionsData = await getData({
    endpoint: getAddedSolutionsDataEndpoint, accessToken, logger,
  });

  const getOrderDescriptionDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getDescription', options: { orderId } });
  const orderDescriptionData = await getData({
    endpoint: getOrderDescriptionDataEndpoint, accessToken, logger,
  });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
    orderItems: addedSolutionsData.catalogueSolutions,
  });
};

export const putCatalogueSolutions = async ({ orderId, accessToken }) => {
  const putCatalogueEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'putCatalogueSolutions', options: { orderId } });
  try {
    const body = {
      status: 'complete',
    };

    await putData({
      endpoint: putCatalogueEndpoint,
      body,
      accessToken,
      logger,
    });
    return { success: true };
  } catch (err) {
    logger.error(`Error updating catalogue-solutions for ${orderId}`);
    throw new Error();
  }
};
