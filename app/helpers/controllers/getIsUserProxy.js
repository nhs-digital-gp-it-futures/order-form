export const getIsUserProxy = async (relatedOrganisationIds) => {
  if (!relatedOrganisationIds) {
    return false;
  }

  const userIsProxy = relatedOrganisationIds.length > 0;
  return userIsProxy;
};
