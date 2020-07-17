import { getContext, getErrorContext } from './contextCreator';

export const getAdditionalServicePricePageContext = params => getContext(params);
export const getAdditionalServicePriceErrorPageContext = params => getErrorContext(params);

export const validateAdditionalServicePriceForm = ({ data }) => {
  if (data.selectAdditionalServicePrice && data.selectAdditionalServicePrice.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectAdditionalServicePrice',
      id: 'SelectAdditionalServicePriceRequired',
    },
  ];
  return { success: false, errors };
};
