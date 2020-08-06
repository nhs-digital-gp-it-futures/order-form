import { getContext } from './contextCreator';
import { getOrders } from '../../helpers/api/ordapi/getOrders';

export const getDashboardContext = async ({ orgName, orgId, accessToken }) => {
  const { completedOrders, incompletedOrders } = await getOrders({ orgId, accessToken });

  return getContext({ orgName, completedOrders, incompletedOrders });
};
