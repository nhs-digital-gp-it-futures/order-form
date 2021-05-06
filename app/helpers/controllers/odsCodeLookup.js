import { getOrganisation } from '../api/oapi/getOrganisation';
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
