import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { organisationApiUrl } from '../../../config';

const getOrganisationEndpoint = ({ orgId }) => (
  `${organisationApiUrl}/api/v1/Organisations/${orgId}`
);

export const getOrganisation = async ({ orgId, accessToken }) => {
  const orgDataEndpoint = getOrganisationEndpoint({ orgId });
  const organisationData = await getData({ endpoint: orgDataEndpoint, accessToken, logger });
  logger.info(`Organisation with id: ${orgId} found in OAPI`);
  return organisationData;
};
