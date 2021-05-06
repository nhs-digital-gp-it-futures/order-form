import { getContext } from './contextCreator';
import { getOrders } from '../../helpers/api/ordapi/getOrders';
import { getIsUserProxy } from '../../helpers/controllers/getIsUserProxy';

import { getOdsCodeForOrganisation } from '../../helpers/controllers/odsCodeLookup';

export const getDashboardContext = async ({
  req,
  sessionManager,
  orgName,
  orgId,
  accessToken,
  relatedOrganisationIds,
}) => {
  const { completedOrders, incompletedOrders } = await getOrders({ orgId, accessToken });
  const userIsProxy = await getIsUserProxy(relatedOrganisationIds);

  const odsCode = await getOdsCodeForOrganisation({
    req, sessionManager, orgId, accessToken,
  });

  return getContext({
    orgName, completedOrders, incompletedOrders, userIsProxy, odsCode,
  });
};
