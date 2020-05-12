import { getContext } from './contextCreator';

export const getNewOrderPageContext = () => getContext({ orderId: 'neworder' });
