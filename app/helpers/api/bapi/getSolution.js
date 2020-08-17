import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getSolutionEndpoint = solutionId => (
  `${solutionsApiUrl}/api/v1/solutions/${solutionId}`
);
export const getSolution = async ({ solutionId, accessToken }) => {
  const endpoint = getSolutionEndpoint(solutionId);
  const solutionData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrieved solution data from BAPI for ${solutionId}`);

  return solutionData;
};
