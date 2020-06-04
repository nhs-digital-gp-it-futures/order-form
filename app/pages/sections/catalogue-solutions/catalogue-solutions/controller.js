import { getData, putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const getCatalogueSolutionsPageContext = async ({ orderId, accessToken }) => {
  const getAddedSolutionsDataEndpoint = getEndpoint({ endpointLocator: 'getAddedCatalogueSolutions', options: { orderId } });
  const addedSolutionsData = await getData({
    endpoint: getAddedSolutionsDataEndpoint, accessToken, logger,
  });

  return getContext({
    orderId,
    orderDescription: addedSolutionsData.orderDescription,
    catalogueSolutions: addedSolutionsData.catalogueSolutions,
  });
};

export const putCatalogueSolutions = async ({ orderId, accessToken }) => {
  const putCatalogueEndpoint = getEndpoint({ endpointLocator: 'putCatalogueSolutions', options: { orderId } });
  try {
    await putData({
      endpoint: putCatalogueEndpoint, accessToken, logger,
    });
    return { success: true };
  } catch (err) {
    logger.error(`Error updating catalogue-solutions for ${orderId}`);
    throw new Error();
  }
};
