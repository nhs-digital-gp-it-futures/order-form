import { getContext } from './contextCreator';
import { getOrderDescription } from '../../../../../helpers/routes/getOrderDescription';
import { deleteCatalogueSolution as apiDeleteCatalogueSolution } from '../../../../../helpers/api/ordapi/deleteCatalogueSolution';

export const getDeleteCatalogueSolutionContext = async ({
  req,
  sessionManager,
  accessToken,
  logger,
  odsCode,
}) => {
  const { orderId } = req.params;
  const { orderItemId } = req.params;
  const { solutionName } = req.params;
  const orderDescription = await getOrderDescription({
    req,
    sessionManager,
    accessToken,
    logger,
  });

  return getContext({
    orderId, orderItemId, solutionName, orderDescription, odsCode,
  });
};

export const deleteCatalogueSolution = async ({
  orderId,
  orderItemId,
  accessToken,
}) => {
  await apiDeleteCatalogueSolution({ orderId, orderItemId, accessToken });
};
