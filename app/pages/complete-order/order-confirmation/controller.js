import { getContext } from './contextCreator';

export const getOrderConfirmationContext = async ({
  orderId,
  fundingSource,
  odsCode,
}) => getContext(
  { orderId, fundingSource, odsCode },
);
