import { postData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getDescriptionContext = params => getContext(params);

export const postOrPutDescription = async ({
  orgId, orderId, accessToken, data,
}) => {
  const isNewOrder = orderId === 'neworder';
  // TODO: replace null with PUT endpoint
  const endpoint = isNewOrder
    ? getEndpoint({ endpointLocator: 'postDescription', options: { orgId } })
    : null;
  const body = { orderDescription: data.description };
  const apiCallParams = {
    endpoint,
    body,
    accessToken,
    logger,
  };

  try {
    // TODO: call putData if not new order
    const response = isNewOrder ? await postData(apiCallParams) : {};
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
