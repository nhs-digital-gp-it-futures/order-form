import { getContext } from './contextCreator';
import { getOrders } from '../../helpers/api/ordapi/getOrders';
import { getIsUserProxy } from '../../helpers/controllers/getIsUserProxy';

export const getDashboardContext = async ({ orgName, orgId, accessToken }) => {
  const { completedOrders, incompletedOrders } = await getOrders({ orgId, accessToken });
  const userIsProxy = await getIsUserProxy({ accessToken, orgId });

  return getContext({
    orgName, completedOrders, incompletedOrders, userIsProxy,
  });
};
