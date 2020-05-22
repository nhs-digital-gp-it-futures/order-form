import { getContext, getErrorContext } from './contextCreator';

export const getSupplierSearchPageContext = async ({ orderId }) => (
  getContext({ orderId })
);

export const validateSupplierSearchForm = ({ data }) => {
  if (data.supplierName && data.supplierName.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'supplierName',
      id: 'SupplierNameRequired',
    },
  ];
  return { success: false, errors };
};

export const getSupplierSearchPageErrorContext = params => getErrorContext(params);
