import { getContext } from './contextCreator';

export const getAdditionalServicesPageContext = async ({ orderId }) => {
  return getContext({
    orderId,
    orderDescription: undefined,
  });
};
