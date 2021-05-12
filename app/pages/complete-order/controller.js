import { getContext } from './contextCreator';

export const getCompleteOrderContext = async ({
  orderId,
  orderDescription,
  fundingSource,
  odsCode,
}) => getContext(
  {
    orderId, orderDescription, fundingSource, odsCode,
  },
);
