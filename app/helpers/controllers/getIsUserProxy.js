import { getProxyOrganisations } from '../api/oapi/getProxyOrganisations';

export const getIsUserProxy = async ({ accessToken, orgId }) => {
  if (!accessToken) {
    return false;
  }

  const proxyOrganisations = await getProxyOrganisations({ accessToken, orgId });

  const userIsProxy = proxyOrganisations.length > 0;
  return userIsProxy;
};
