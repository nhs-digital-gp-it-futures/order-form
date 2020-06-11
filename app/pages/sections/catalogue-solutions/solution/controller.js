import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../endpoints';
import { logger } from '../../../../logger';
import { getContext, getErrorContext } from './contextCreator';

export const getSolutionsPageContext = params => getContext(params);

export const findSolutions = async ({ supplierId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getSolutionsForSupplier', options: { supplierId } });
  const solutions = await getData({ endpoint, accessToken, logger });
  logger.info(`Searching for solutions for Supplier "${supplierId}" returned ${solutions.length} solutions`);

  return solutions.solutions;
};

export const getSupplierId = async ({ orderId, accessToken }) => {
  const endpoint = getEndpoint({ endpointLocator: 'getOrdapiSupplier', options: { orderId } });
  const ordapiSupplierData = await getData({ endpoint, accessToken, logger });
  logger.info(`Supplier ID for order "${orderId}" is ${ordapiSupplierData.supplierId}`);

  return ordapiSupplierData.supplierId;
};

export const getSolutionsErrorPageContext = params => getErrorContext(params);

export const validateSolutionForm = ({ data }) => {
  if (data.selectSolution && data.selectSolution.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectSolution',
      id: 'SelectSolutionRequired',
    },
  ];
  return { success: false, errors };
};
