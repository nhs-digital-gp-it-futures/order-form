import { getContext, getErrorContext } from './contextCreator';

export const getFundingSourcesContext = async ({ orderId, fundingSource }) => getContext(
  { orderId, fundingSource },
);
export const getFundingSourcesErrorPageContext = params => getErrorContext(params);

export const validateFundingSourcesForm = ({ data }) => {
  if (data.selectFundingSource && data.selectFundingSource.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectFundingSource',
      id: 'SelectFundingSourceRequired',
    },
  ];
  return { success: false, errors };
};
