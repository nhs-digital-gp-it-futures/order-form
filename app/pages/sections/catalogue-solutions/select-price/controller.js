import { getContext } from './contextCreator';

export const getSolutionsPricePageContext = async ({ orderId }) => getContext({ orderId });
