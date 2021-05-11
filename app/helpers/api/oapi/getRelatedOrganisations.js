import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { organisationApiUrl } from '../../../config';

const getRelatedOrganisationsEndpoint = ({ orgId }) => (
  `${organisationApiUrl}/api/v1/Organisations/${orgId}/related-organisations`
);

export const getRelatedOrganisations = async ({ accessToken, orgId }) => {
  const orgDataEndpoint = `${getRelatedOrganisationsEndpoint({ orgId })}`;
  const organisationData = await getData({ endpoint: orgDataEndpoint, accessToken, logger });
  logger.info('Get Related Organisations found in OAPI');
  return organisationData;
};
