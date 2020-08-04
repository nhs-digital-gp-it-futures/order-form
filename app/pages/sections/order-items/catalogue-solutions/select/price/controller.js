import { getContext, getErrorContext } from './contextCreator';

export const getSolutionPricePageContext = params => getContext(params);

export const getSolutionPriceErrorPageContext = params => getErrorContext(params);

export const validateSolutionPriceForm = ({ data }) => {
  if (data.selectSolutionPrice && data.selectSolutionPrice.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectSolutionPrice',
      id: 'SelectSolutionPriceRequired',
    },
  ];
  return { success: false, errors };
};
