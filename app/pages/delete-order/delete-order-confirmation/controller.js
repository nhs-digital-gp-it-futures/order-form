import { getContext } from './contextCreator';
import { getOrderDescription } from '../../../helpers/routes/getOrderDescription';

export const getDeleteOrderConfirmationContext = async ({
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
