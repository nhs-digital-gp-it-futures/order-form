import { getOrganisation } from '../api/oapi/getOrganisation';
import { getOrganisationUsingOdsCode } from '../api/oapi/getOrganisationUsingOdsCode';
import { sessionKeys } from '../routes/sessionHelper';

const saveLookupTableToSession = ({
  organisation, lookupTable, req, sessionManager,
}) => {
  const { organisationId, odsCode } = organisation;
  const newRow = { organisationId, odsCode };

  lookupTable.push(newRow);

  sessionManager.saveToSession(
    { req, key: sessionKeys.odsLookupTable, value: lookupTable },
  );
};

const findOdsCode = ({ orgId, lookupTable }) => {
  const found = lookupTable.filter((row) => row.organisationId === orgId);
  return found.length === 1 ? found[0].odsCode : undefined;
};

const findOrgId = ({ odsCode, lookupTable }) => {
  const found = lookupTable.filter((row) => row.odsCode === odsCode);
  return found.length === 1 ? found[0].organisationId : undefined;
};

const getOrganisationOdsCodeFromApi = async ({
  req, sessionManager, lookupTable, orgId, accessToken,
}) => {
  const organisation = await getOrganisation({ orgId, accessToken });
  if (!(organisation && organisation.odsCode)) {
    return undefined;
  }

  saveLookupTableToSession({
    organisation, lookupTable, req, sessionManager,
  });

  return organisation.odsCode;
};

export const getOdsCodeForOrganisation = async ({
  req, sessionManager, orgId, accessToken,
}) => {
  if (!orgId) {
    return undefined;
  }

  const lookupTable = sessionManager.getFromSession({ req, key: sessionKeys.odsLookupTable }) ?? [];

  return findOdsCode({ orgId, lookupTable }) ?? getOrganisationOdsCodeFromApi({
    req, sessionManager, lookupTable, orgId, accessToken,
  });
};

export const getOrganisationFromOdsCode = async ({
  req, sessionManager, odsCode, accessToken,
}) => {
  if (!odsCode) {
    return undefined;
  }

  const lookupTable = sessionManager.getFromSession({ req, key: sessionKeys.odsLookupTable }) ?? [];
  let orgId = findOrgId({ odsCode, lookupTable });

  if (!orgId) {
    const organisation = await getOrganisationUsingOdsCode({ odsCode, accessToken });
    const organisationData = {};
    if (organisation && organisation.organisationId) {
      orgId = organisation.organisationId;
      organisationData.organisationId = orgId;
      organisationData.name = organisation.organisationName;
      organisationData.odsCode = organisation.odsCode;

      saveLookupTableToSession({
        organisation, lookupTable, req, sessionManager,
      });
    }

    return organisationData;
  }

  const organisation = await getOrganisation({ orgId, accessToken });
  return organisation;
};
