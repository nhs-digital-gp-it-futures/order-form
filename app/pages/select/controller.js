import { getRelatedOrganisations } from '../../helpers/api/oapi/getOrganisation';

export const getSelectContext = async ({ accessToken, organisation }) => {
  const organisationsList = await getRelatedOrganisations(
    {
      accessToken,
      orgId: organisation.primary.id,
    },
  );

  let radioList;

  if (organisationsList) {
    radioList = organisationsList.map((org) => ({ value: org.organisationId, text: org.name }));
  }

  const context = {
    primaryName: organisation.primary.name,
    organisationList: radioList,
  };

  return context;
};
