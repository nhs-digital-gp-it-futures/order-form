import { putData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../endpoints';
import { logger } from '../../../../../logger';
import { getContext } from './contextCreator';
import { getOrderItems } from '../../../../../helpers/api/ordapi/getOrderItems';
import { getOrderDescription } from '../../../../../helpers/api/ordapi/getOrderDescription';

export const getCatalogueSolutionsPageContext = async ({ orderId, accessToken }) => {
  const catalogueItemType = 'Solution';
  const solutionOrderItemsData = await getOrderItems({ orderId, catalogueItemType, accessToken });
  const orderDescriptionData = await getOrderDescription({ orderId, accessToken });

  return getContext({
    orderId,
    orderDescription: orderDescriptionData ? orderDescriptionData.description : '',
    orderItems: solutionOrderItemsData,
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
