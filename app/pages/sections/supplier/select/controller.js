import { getContext, getErrorContext } from './contextCreator';

export const getSupplierSelectPageContext = params => getContext(params);

export const validateSupplierSelectForm = ({ data }) => {
  if (data.selectSupplier && data.selectSupplier.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectSupplier',
      id: 'SelectSupplierRequired',
    },
  ];
  return { success: false, errors };
};

export const getSupplierSelectErrorPageContext = params => getErrorContext(params);
