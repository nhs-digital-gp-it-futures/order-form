import { postData, putData, getData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getDescriptionContext = async ({ orderId, accessToken }) => {
  let descriptionData = '';
  if (orderId !== 'neworder') {
    const endpoint = getEndpoint({ endpointLocator: 'getDescription', options: { orderId } });
    descriptionData = await getData({ endpoint, accessToken, logger });
    logger.info(`Description for order id: ${orderId} returned`);
  }
  return getContext({ orderId, description: descriptionData ? descriptionData.description : '' });
};

export const getDescriptionErrorContext = async params => getErrorContext(params);

export const postOrPutDescription = async ({
  orgId, orderId, accessToken, data,
}) => {
  const isNewOrder = orderId === 'neworder';
  const endpoint = isNewOrder
    ? getEndpoint({ endpointLocator: 'postDescription' })
    : getEndpoint({ endpointLocator: 'putDescription', options: { orderId } });
  const apiCallParams = {
    endpoint,
    body: isNewOrder ? {
      ...data,
      organisationId: orgId,
    } : data,
    accessToken,
    logger,
  };

  try {
    const response = isNewOrder ? await postData(apiCallParams) : await putData(apiCallParams);
    const returnOrderId = (response.data && response.data.orderId)
      ? response.data.orderId
      : orderId;
    logger.info(`Order ${isNewOrder ? 'added' : 'updated'} - id: ${returnOrderId}, ${JSON.stringify(data)}`);
    return { success: true, orderId: returnOrderId };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error adding order');
    throw new Error();
  }
};
