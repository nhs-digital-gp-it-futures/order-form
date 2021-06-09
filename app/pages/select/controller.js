import { formatErrors, formatAllErrors, addErrorsAndDataToManifest } from 'buying-catalogue-library';
import { generateQuestionsContext } from './contextCreator';
import { getProxyOrganisations } from '../../helpers/api/oapi/getProxyOrganisations';
import manifest from './manifest.json';
import { baseUrl } from '../../config';

export const getSelectContext = async ({
  accessToken, orgId, orgName, odsCode, selectedOdsCode, op,
}) => {
  const organisationsList = await getProxyOrganisations({ accessToken, orgId });
  const context = {
    ...manifest,
    backLinkHref: selectedOdsCode
      ? `${baseUrl}/organisation/${selectedOdsCode}` : `${baseUrl}/organisation/${odsCode}`,
    primaryName: orgName,
    questions: organisationsList && generateQuestionsContext({
      organisationsList, orgId, orgName,
    }),
    odsCode,
    orgId,
    orgName,
    op,
  };

  context.description = 'Select the organisation you want to act on behalf of.';

  return context;
};

export const getSelectErrorContext = async ({ accessToken, req, selectedOdsCode }) => {
  const context = await getSelectContext({
    accessToken,
    orgId: req.body.orgId,
    orgName: req.body.orgName,
    odsCode: req.body.odsCode,
    selectedOdsCode,
    op: req.body.op,
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
