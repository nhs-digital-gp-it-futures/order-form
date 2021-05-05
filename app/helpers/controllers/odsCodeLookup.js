export const getOdsCodeForOrganisation = (organisationId) => {
  let code;

  switch (organisationId) {
    case 'abc':
      code = '123';
      break;

    case 'def':
      code = '456';
      break;

    default: break;
  }

  return code;
};

// export const getOrganisationIdForOdsCode = async (odsCode) => {

// };
