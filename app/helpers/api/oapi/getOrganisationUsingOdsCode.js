import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { organisationApiUrl } from '../../../config';

const getOrganisationUsingOdsCodeEndpoint = ({ odsCode }) => (
  `${organisationApiUrl}/api/v1/ods/${odsCode}`
);

export const getOrganisationUsingOdsCode = async ({ odsCode, accessToken }) => {
  const orgDataEndpoint = getOrganisationUsingOdsCodeEndpoint({ odsCode });
  const organisationData = await getData({ endpoint: orgDataEndpoint, accessToken, logger });
  logger.info(`Organisation with ods code: ${odsCode} found in OAPI`);
  return organisationData;
};
