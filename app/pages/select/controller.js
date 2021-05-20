import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { generateQuestionsContext } from './contextCreator';
import { getProxyOrganisations } from '../../helpers/api/oapi/getProxyOrganisations';
import manifest from './manifest.json';
import { baseUrl } from '../../config';

export const getSelectContext = async ({
  accessToken, orgId, orgName, odsCode, currentOdsCode,
}) => {
  const organisationsList = await getProxyOrganisations({ accessToken, orgId });
  const context = {
    ...manifest,
    backLinkHref: currentOdsCode
      ? `${baseUrl}/organisation/${currentOdsCode}` : `${baseUrl}/organisation/${odsCode}`,
    primaryName: orgName,
    questions: organisationsList && generateQuestionsContext({
      organisationsList, orgId, orgName,
    }),
    odsCode,
    orgId,
    orgName,
  };

  return context;
};

export const getSelectErrorContext = async ({ accessToken, req, currentOdsCode }) => {
  const context = await getSelectContext({
    accessToken,
    orgId: req.body.orgId,
    orgName: req.body.orgName,
    odsCode: req.body.odsCode,
    currentOdsCode,
  });

  const errors = [
    {
      field: 'organisation',
      id: 'SelectOrganisation',
    },
  ];

  const formattedErrors = formatErrors({ manifest: context, errors });
  const modifiedManifest = addErrorsAndDataToManifest({
    manifest: context, errors: formattedErrors,
  });
  const allErrors = formatAllErrors(modifiedManifest.questions);

  return {
    ...modifiedManifest,
    errors: allErrors,
  };
};
