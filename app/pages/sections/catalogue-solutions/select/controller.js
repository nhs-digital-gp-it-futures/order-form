import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const getSolutionsSelectPageContext = params => getContext(params);

export const findSolutions = async ({ supplierId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSolutionsForSupplier', options: { supplierId } });
  const solutionsFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for solutions for Supplier "${supplierId}" returned ${solutionsFound.length} solutions`);

  return solutionsFound;
};
