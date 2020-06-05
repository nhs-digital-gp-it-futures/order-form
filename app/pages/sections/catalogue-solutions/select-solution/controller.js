import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext } from './contextCreator';

export const getSolutionsSelectPageContext = params => getContext(params);

export const findSolutions = async ({ supplierId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSolutionsForSupplier', options: { supplierId } });
  const solutionsFound = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for solutions for Supplier "${supplierId}" returned ${solutionsFound.length} solutions`);

  return solutionsFound.solutions;
};

export const getSupplierId = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getOrdapiSupplier', options: { orderId } });
  const ordapiSupplierData = await getData({ endpoint, accessToken, logger });
  logger.info(`Supplier ID for order "${orderId}" is ${ordapiSupplierData.supplierId}`);

  return ordapiSupplierData.supplierId;
};
