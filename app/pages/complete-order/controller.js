import { getContext } from './contextCreator';

export const getCompleteOrderContext = async ({
  orderId,
  orderDescription,
  fundingSource,
}) => getContext(
  { orderId, orderDescription, fundingSource },
);
