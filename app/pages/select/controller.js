import { getRelatedOrganisations } from '../../helpers/api/oapi/getOrganisation';

export const getProxyOrganisations = async ({ accessToken, orgId }) => {
  const organisationsList = await getRelatedOrganisations({ accessToken, orgId });
  return organisationsList;
};

export const getSelectContext = async ({ accessToken, orgId, orgName }) => {
  const organisationsList = await getProxyOrganisations({ accessToken, orgId });

  let radioList;

  if (organisationsList) {
    radioList = organisationsList.map((org) => ({ value: org.organisationId, text: org.name }));
    radioList.sort((a, b) => a.text.localeCompare(b.text));
  }

  const context = {
    primaryName: orgName,
    organisationList: radioList,
  };

  return context;
};

export const getIsUserProxy = async ({ accessToken, orgId }) => {
  if (!accessToken) {
    return false;
  }

  const proxyOrganisations = await getProxyOrganisations({ accessToken, orgId });

  const userIsProxy = proxyOrganisations.length > 0;
  return userIsProxy;
};
