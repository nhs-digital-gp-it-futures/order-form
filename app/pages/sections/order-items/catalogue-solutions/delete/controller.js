import { deleteCatalogueSolution as apiDeleteCatalogueSolution } from '../../../../../helpers/api/ordapi/deleteCatalogueSolution';

export const deleteCatalogueSolution = async ({
  orderId,
  orderItemId,
  accessToken,
}) => {
  await apiDeleteCatalogueSolution({ orderId, orderItemId, accessToken });
};
