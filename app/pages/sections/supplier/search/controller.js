import { getContext } from './contextCreator';

export const getSupplierSearchPageContext = async ({ orderId }) => (
  getContext({ orderId })
);
