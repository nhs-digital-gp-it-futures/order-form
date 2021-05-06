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

export const getOdsCodeForOrganisation = async ({
  req, sessionManager, orgId, accessToken,
}) => {
  let odsCode;

  if (orgId) {
    let lookupTable = sessionManager.getFromSession({ req, key: sessionKeys.odsLookupTable });

    if (lookupTable) {
      odsCode = findOdsCode({ orgId, lookupTable });
    } else {
      lookupTable = [];
    }

    if (!odsCode) {
      const organisation = await getOrganisation({ orgId, accessToken });

      if (organisation && organisation.odsCode) {
        odsCode = organisation.odsCode;

        saveLookupTableToSession({
          organisation, lookupTable, req, sessionManager,
        });
      }
    }
  }

  return odsCode;
};

export const getOrganisationIdFromOdsCode = async ({
  req, sessionManager, odsCode, accessToken,
}) => {
  let orgId;

  if (odsCode) {
    let lookupTable = sessionManager.getFromSession({ req, key: sessionKeys.odsLookupTable });

    if (lookupTable) {
      orgId = findOrgId({ odsCode, lookupTable });
    } else {
      lookupTable = [];
    }

    if (!orgId) {
      const organisation = await getOrganisationUsingOdsCode({ odsCode, accessToken });

      if (organisation && organisation.organisationId) {
        orgId = organisation.organisationId;

        saveLookupTableToSession({
          organisation, lookupTable, req, sessionManager,
        });
      // } else {
      //   console.log('=================', 'getOrganisationUsingOdsCode', organisation);
      //   if (!organisation.organisationId) {
      //     console.error('===== ERROR, no organisationId');
      //   }
      }
    }
  }

  return orgId;
};
