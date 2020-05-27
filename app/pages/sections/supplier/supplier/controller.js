import { getContext } from './contextCreator';

export const getSupplierPageContext = async ({ orderId }) => (
  getContext({ orderId })
);
