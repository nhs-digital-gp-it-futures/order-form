import manifest from './manifest.json';

const transformOrganisationList = (organisationsList, selectedOrgId, orgId, orgName) => {
  if (!organisationsList) {
    return undefined;
  }

  const radioList = organisationsList.map((org) => (
    {
      value: org.organisationId,
      text: org.name,
      checked: org.organisationId === selectedOrgId ? true : undefined,
    }));
  radioList.sort((a, b) => a.text.localeCompare(b.text));

  radioList.unshift({
    value: orgId,
    text: orgName,
    checked: orgId === selectedOrgId ? true : undefined,
  });

  return radioList;
};

export const generateQuestionsContext = ({
  organisationsList, selectedOrgId, orgId, orgName,
}) => (
  manifest.questions.map((question) => ({
    ...question,
    options: transformOrganisationList(organisationsList, selectedOrgId, orgId, orgName),
  }))
);
