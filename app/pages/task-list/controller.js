import { getContext } from './contextCreator';
import { logger } from '../../logger';
import { getOrderSummary } from '../../helpers/api/ordapi/getOrderSummary';

const getNewOrderTaskListPageContext = ({ orderId, odsCode }) => getContext({ orderId, odsCode });

const getExistingOrderTaskListPageContext = async ({ accessToken, orderId, odsCode }) => {
  const orderSummary = await getOrderSummary({ orderId, accessToken });
  logger.info(`Existing order summary '${orderSummary.orderId}' returned`);
  return getContext({
    orderId,
    orderDescription: orderSummary.description,
    sectionsData: orderSummary.sections,
    enableSubmitButton: orderSummary.enableSubmitButton,
    odsCode,
  });
};

export const getTaskListPageContext = ({ accessToken, orderId, odsCode }) => {
  if (orderId === 'neworder') {
    return getNewOrderTaskListPageContext({ orderId, odsCode });
  }
  return getExistingOrderTaskListPageContext({ accessToken, orderId, odsCode });
};
