import { getContext } from './contextCreator';

export const getDeleteCatalogueSolutionConfirmationContext = async ({
  req,
}) => {
  const { orderId } = req.params;
  const { solutionName } = req.params;

  return getContext({ orderId, solutionName });
};
