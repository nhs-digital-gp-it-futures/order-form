import { getContext } from './contextCreator';

export const getFundingSourcesContext = async ({ orderId }) => getContext({ orderId });
