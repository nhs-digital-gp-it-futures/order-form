import { postData, putData } from 'buying-catalogue-library';
import { getContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

export const getDescriptionContext = params => getContext(params);

export const postOrPutDescription = async ({
  orgId, orderId, accessToken, data,
}) => {
  const isNewOrder = orderId === 'neworder';
  const endpoint = isNewOrder
    ? getEndpoint({ endpointLocator: 'postDescription' })
    : getEndpoint({ endpointLocator: 'putDescription', options: { orderId } });
  const body = { description: data.description };
  const apiCallParams = {
    endpoint,
    body: isNewOrder ? {
      ...body,
      organisationId: orgId,
    } : body,
    accessToken,
    logger,
  };

  try {
    const response = isNewOrder ? await postData(apiCallParams) : await putData(apiCallParams);
    const returnOrderId = (response.data && response.data.orderId) ? response.data.orderId : orderId;
    logger.info(`Order ${isNewOrder ? 'added' : 'updated'} - id: ${returnOrderId}, ${JSON.stringify(body)}`);
    return { success: true, orderId: returnOrderId };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      // TODO: validation
      return { success: false };
    }
    logger.error('Error adding order');
    throw new Error();
  }
};

// {
//   endpoint: 'http://localhost:5104/api/v1/orders/order-id/sections/description',
//   body: { description: '' },
//   accessToken: undefined
// }

// {
//   endpoint: 'http://localhost:5104/api/v1/orders',
//   body: { description: '', organisationId: 'org-id' },
//   accessToken: undefined
// }
// { success: true, orderId: 'order1' }