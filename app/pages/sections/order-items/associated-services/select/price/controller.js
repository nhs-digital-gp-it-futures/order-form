import { getContext, getErrorContext } from './contextCreator';

export const getAssociatedServicePricePageContext = params => getContext(params);
export const getAssociatedServicePriceErrorPageContext = params => getErrorContext(params);

export const validateAssociatedServicePriceForm = ({ data }) => {
  if (data.selectAssociatedServicePrice && data.selectAssociatedServicePrice.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectAssociatedServicePrice',
      id: 'SelectAssociatedServicePriceRequired',
    },
  ];
  return { success: false, errors };
};
