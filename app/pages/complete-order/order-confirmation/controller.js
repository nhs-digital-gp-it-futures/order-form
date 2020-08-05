import { getContext } from './contextCreator';

export const getOrderConfirmationContext = async ({
  orderId,
  fundingSource,
}) => getContext(
  { orderId, fundingSource },
);
