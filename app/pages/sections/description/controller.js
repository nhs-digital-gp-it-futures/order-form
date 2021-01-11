import { getContext, getErrorContext } from './contextCreator';
import { logger } from '../../../logger';
import { getOrderDescription } from '../../../helpers/routes/getOrderDescription';
import { postDescription } from '../../../helpers/api/ordapi/postDescription';
import { putDescription } from '../../../helpers/api/ordapi/putDescription';

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

export const getDescriptionErrorContext = async (params) => getErrorContext(params);

export const postOrPutDescription = async ({
  orgId, orderId, accessToken, data,
}) => {
  const isNewOrder = orderId === 'neworder';
  try {
    return isNewOrder
      ? await postDescription({ orgId, accessToken, formData: data })
      : await putDescription({ orderId, accessToken, formData: data });
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error adding order');
    throw new Error();
  }
};
