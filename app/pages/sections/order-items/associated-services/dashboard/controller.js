import { getContext } from './contextCreator';

export const getAssociatedServicesPageContext = async ({ orderId }) => getContext({ orderId });
