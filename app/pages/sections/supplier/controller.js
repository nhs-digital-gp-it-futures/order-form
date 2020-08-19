import { getSupplier } from '../../../helpers/api/ordapi/getSupplier';

export const checkOrdapiForSupplier = async ({ orderId, accessToken }) => {
  const ordapiSupplierData = await getSupplier({ orderId, accessToken });
  return !!(ordapiSupplierData && ordapiSupplierData.name);
};
