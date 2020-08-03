import { getContext } from './contextCreator';

export const getCompleteOrderContext = async ({ orderId, description }) => getContext(
  { orderId, description },
);
