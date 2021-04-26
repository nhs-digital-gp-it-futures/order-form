import { getRelatedOrganisations } from '../../helpers/api/oapi/getOrganisation';

export const getSecondaryOrganisationList = async ({ accessToken, organisation }) => {
  const organisationsList = await getRelatedOrganisations(
    {
      accessToken,
      orgId: organisation.primary.id,
    },
  );

  return organisationsList;
};

export const getSelectContext = async ({ accessToken, organisation }) => {
  const organisationsList = await getSecondaryOrganisationList({ accessToken, organisation });

  let radioList;

  if (organisationsList) {
    radioList = organisationsList.map((org) => ({ value: org.organisationId, text: org.name }));
    radioList.sort((a, b) => a.text.localeCompare(b.text));
  }

  const context = {
    primaryName: organisation.primary.name,
    organisationList: radioList,
  };

  return context;
};
