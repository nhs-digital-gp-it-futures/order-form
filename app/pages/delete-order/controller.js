import { getContext } from './contextCreator';
import { getOrderDescription } from '../../helpers/routes/getOrderDescription';
import { deleteOrder } from '../../helpers/api/ordapi/deleteOrder';

export const getDeleteOrderContext = async ({
  req,
  sessionManager,
  accessToken,
  logger,
}) => {
  const { orderId } = req.params;
  const orderDescription = await getOrderDescription({
    req,
    sessionManager,
    accessToken,
    logger,
  });

  return getContext({ orderId, orderDescription });
};

export const deleteAnOrder = async ({
  orderId,
  accessToken,
}) => {
  await deleteOrder({ orderId, accessToken });
};
