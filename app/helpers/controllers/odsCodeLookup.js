const inMemoryLookupTable = [
  { orgId: 'abc', odsCode: '123' },
  { orgId: 'def', odsCode: '456' },
];
export const getLookUpTable = () => inMemoryLookupTable;

const findOdsCode = (orgId) => {
  const lookupTable = getLookUpTable();
  const found = lookupTable.filter((row) => row.orgId === orgId);
  let odsCode;

  if (found.length === 1) {
    odsCode = found[0].odsCode;
  } else {
    // search API

    odsCode = '890';

    inMemoryLookupTable.push({ orgId, odsCode });
  }

  return odsCode;
};

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

export const getOdsCodeForOrganisation = (organisationId) => {
  if (organisationId) {
    const odsCode = findOdsCode(organisationId);
    return odsCode;
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
