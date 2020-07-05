import { getContext } from './contextCreator';

export const getAdditionalServicesPageContext = async ({ orderId }) => getContext({
  orderId,
  orderDescription: undefined,
});
