import { getContext } from './contextCreator';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';
import { deleteOrder as apiDeleteOrder } from '../../helpers/api/ordapi/deleteOrder';

export const getDeleteOrderContext = async ({
  req,
  sessionManager,
  accessToken,
  logger,
  odsCode,
}) => {
  const { orderId } = req.params;
  const orderDescription = await getOrderDescription({
    req,
    sessionManager,
    accessToken,
    logger,
  });

  return getContext({ orderId, orderDescription, odsCode });
};

export const deleteOrder = async ({
  orderId,
  accessToken,
}) => {
  await apiDeleteOrder({ orderId, accessToken });
};
