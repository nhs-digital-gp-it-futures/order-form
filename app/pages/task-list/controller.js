import { getContext } from './contextCreator';
import { logger } from '../../logger';
import { getOrderSummary } from '../../helpers/api/ordapi/getOrderSummary';

const getNewOrderTaskListPageContext = ({ orderId, odsCode }) => getContext({ orderId, odsCode });

const getExistingOrderTaskListPageContext = async ({
  req, accessToken, orderId, odsCode, sessionManager,
}) => {
  const orderSummary = await getOrderSummary({
    orderId, accessToken, odsCode, sessionManager, req,
  });
  if (!orderSummary) {
    return undefined;
  }
  logger.info(`Existing order summary '${orderSummary.orderId}' returned`);
  return getContext({
    orderId,
    orderDescription: orderSummary.description,
    sectionsData: orderSummary.sections,
    enableSubmitButton: orderSummary.enableSubmitButton,
    odsCode,
  });
};

export const getTaskListPageContext = ({
  req, accessToken, orderId, odsCode, sessionManager,
}) => {
  if (orderId === 'neworder') {
    return getNewOrderTaskListPageContext({ orderId, odsCode });
  }
  return getExistingOrderTaskListPageContext({
    req, accessToken, orderId, odsCode, sessionManager,
  });
};
