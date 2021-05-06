import { getOrganisation } from '../api/oapi/getOrganisation';
import { sessionKeys } from '../routes/sessionHelper';

const saveLookupTableToSession = ({
  organisation, lookupTable, req, sessionManager,
}) => {
  const { organisationId, odsCode } = organisation;

  const newRow = { organisationId, odsCode };
  let lookup = lookupTable;

  if (!lookup) {
    lookup = [newRow];
  } else {
    lookup.push(newRow);
  }

  sessionManager.saveToSession(
    { req, key: sessionKeys.odsLookupTable, value: lookup },
  );
};

const findOdsCode = ({ orgId, lookupTable }) => {
  const found = lookupTable.filter((row) => row.organisationId === orgId);
  return found.length === 1 ? found[0].odsCode : undefined;
};

export const getOdsCodeForOrganisation = async ({
  req, sessionManager, orgId, accessToken,
}) => {
  let odsCode;

  if (orgId) {
    const lookupTable = sessionManager.getFromSession({ req, key: sessionKeys.odsLookupTable });

    if (lookupTable) {
      odsCode = findOdsCode({ orgId, lookupTable });
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
