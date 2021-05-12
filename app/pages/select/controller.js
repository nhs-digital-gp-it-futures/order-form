import { getProxyOrganisations } from '../../helpers/api/oapi/getProxyOrganisations';

const transformOrganisationList = (organisationsList) => {
  if (!organisationsList) {
    return undefined;
  }

  const radioList = organisationsList.map((org) => (
    {
      value: org.organisationId,
      text: org.name,
    }));
  radioList.sort((a, b) => a.text.localeCompare(b.text));

  return radioList;
};

export const getSelectContext = async ({ accessToken, orgId, orgName }) => {
  const organisationsList = await getProxyOrganisations({ accessToken, orgId });
  const radioList = transformOrganisationList(organisationsList);

  const context = {
    primaryName: orgName,
    organisationList: radioList,
  };

  return context;
};
