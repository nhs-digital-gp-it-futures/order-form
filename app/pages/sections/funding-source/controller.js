import { getContext, getErrorContext } from './contextCreator';

export const getFundingSourceContext = async ({ orderId, fundingSource }) => getContext(
  { orderId, fundingSource },
);
export const getFundingSourceErrorPageContext = (params) => getErrorContext(params);

export const validateFundingSourceForm = ({ data }) => {
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
