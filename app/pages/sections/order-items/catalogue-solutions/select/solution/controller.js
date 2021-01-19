import { getContext, getErrorContext } from './contextCreator';

export const getSolutionsPageContext = (params) => getContext(params);

export const getSolutionsErrorPageContext = (params) => getErrorContext(params);

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
