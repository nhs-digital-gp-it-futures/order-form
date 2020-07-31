import { postData, putData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';
import { getOrderDescription } from '../../../helpers/routes/getOrderDescription';

export const getDescriptionContext = async ({
  req,
  orderId,
  accessToken,
  sessionManager,
}) => {
  let descriptionData = '';

  if (orderId !== 'neworder') {
    descriptionData = await getOrderDescription({
      req,
      accessToken,
      sessionManager,
      logger,
    });
  }

  return getContext({ orderId, description: descriptionData || '' });
};

export const getDescriptionErrorContext = async params => getErrorContext(params);

export const postOrPutDescription = async ({
  orgId, orderId, accessToken, data,
}) => {
  const isNewOrder = orderId === 'neworder';
  const endpoint = isNewOrder
    ? getEndpoint({ api: 'ordapi', endpointLocator: 'postDescription' })
    : getEndpoint({ api: 'ordapi', endpointLocator: 'putDescription', options: { orderId } });
  const apiCallParams = {
    endpoint,
    body: isNewOrder ? {
      description: data.description.trim(),
      organisationId: orgId,
    } : { description: data.description.trim() },
    accessToken,
    logger,
  };

  try {
    const response = isNewOrder ? await postData(apiCallParams) : await putData(apiCallParams);
    const returnOrderId = (response.data && response.data.orderId)
      ? response.data.orderId
      : orderId;
    logger.info(`Order description ${isNewOrder ? 'added' : 'updated'} - id: ${returnOrderId}, ${JSON.stringify(data)}`);
    return { success: true, orderId: returnOrderId };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error adding order');
    throw new Error();
  }
};
