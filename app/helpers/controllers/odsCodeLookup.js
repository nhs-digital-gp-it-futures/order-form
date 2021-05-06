import { getOrganisation } from '../api/oapi/getOrganisation';

const inMemoryLookupTable = [
  { orgId: 'abc', odsCode: '123' },
  { orgId: 'def', odsCode: '456' },
];
const getLookUpTable = () => inMemoryLookupTable;

// const findOdsCode = (orgId) => {
//   const lookupTable = getLookUpTable();
//   const found = lookupTable.filter((row) => row.orgId === orgId);
//   let odsCode;

//   if (found.length === 1) {
//     odsCode = found[0].odsCode;
//   } else {
//     // search API

//     odsCode = '890';

//     inMemoryLookupTable.push({ orgId, odsCode });
//   }

//   return odsCode;
// };

const findOrdId = (odsCode) => {
  const lookupTable = getLookUpTable();
  const found = lookupTable.filter((row) => row.odsCode === odsCode);
  let orgId;

  if (found.length === 1) {
    orgId = found[0].orgId;
  } else {
    // search API

    orgId = 'zxy';

    inMemoryLookupTable.push({ orgId, odsCode });
  }

  return orgId;
};

export const getOdsCodeForOrganisation = async ({ orgId, accessToken }) => {
  if (orgId) {
    const organisation = await getOrganisation({ orgId, accessToken });

    const { odsCode } = organisation;
    return odsCode;

    // return findOdsCode(orgId);
  }

  return undefined;
};

export const getOrganisationIdForOdsCode = (odsCode) => {
  if (odsCode) {
    const orgId = findOrdId(odsCode);
    return orgId;
  }
  return undefined;
};
