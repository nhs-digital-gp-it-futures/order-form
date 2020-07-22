import { getContext } from './contextCreator';

export const getFundingSourcesContext = async ({ orderId, fundingSource }) => getContext(
  { orderId, fundingSource },
);
