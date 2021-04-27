import { getRelatedOrganisations } from './getRelatedOrganisations';

export const getProxyOrganisations = async ({ accessToken, orgId }) => {
  const organisationsList = await getRelatedOrganisations({ accessToken, orgId });
  return organisationsList;
};
