import manifest from './manifest.json';

const transformOrganisationList = (organisationsList, orgId, orgName) => {
  if (!organisationsList) {
    return undefined;
  }

  const radioList = organisationsList.map((org) => (
    {
      value: org.organisationId,
      text: org.name,
    }));
  radioList.sort((a, b) => a.text.localeCompare(b.text));

  radioList.unshift({
    value: orgId,
    text: orgName,
  });

  return radioList;
};

export const generateQuestionsContext = ({
  organisationsList, orgId, orgName,
}) => (
  manifest.questions.map((question) => ({
    ...question,
    options: transformOrganisationList(organisationsList, orgId, orgName),
  }))
);
