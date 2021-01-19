import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { solutionsApiUrl } from '../../../config';

const getSearchSuppliersEndpoint = (name) => (
  `${solutionsApiUrl}/api/v1/suppliers?name=${encodeURIComponent(name)}&solutionPublicationStatus=Published`
);
export const getSearchSuppliers = async ({ name, accessToken }) => {
  const endpoint = getSearchSuppliersEndpoint(name);
  const suppliersFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for "${name}" returned ${suppliersFound.length} suppliers`);

  return suppliersFound;
};
