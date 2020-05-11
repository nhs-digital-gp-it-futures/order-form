import { postData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getDescriptionContext = params => getContext(params);

export const postOrPatchDescription = async ({ orderId, accessToken, data }) => {
  const isNewOrder = orderId === 'neworder';
  // TODO: add PATCH endpoint
  const endpoint = isNewOrder ? getEndpoint({ endpointLocator: 'postDescription' }) : null;
  const body = { orderDescription: data.description };
  const apiCallParams = {
    endpoint,
    body,
    accessToken,
    logger,
  };

  try {
    // TODO: call patchData if not new order
    const response = isNewOrder ? await postData(apiCallParams) : {};
    // const response = { data: { orderId: 'order-id-1' }}
    logger.info(`Order ${isNewOrder ? 'added' : 'updated'} - id: ${response.data.id}, ${JSON.stringify(body)}`);
    return { success: true, orderId: isNewOrder ? response.data.orderId : orderId };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      // TODO: validation
      return { success: false };
    }
    logger.error('Error adding order');
    throw new Error();
  }
};
