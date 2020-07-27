import { getContext } from './contextCreator';
import { logger } from '../../logger';
import { getOrderSummary } from '../../helpers/api/ordapi/getOrderSummary';

const getNewOrderTaskListPageContext = ({ orderId }) => getContext({ orderId });

const getExistingOrderTaskListPageContext = async ({ accessToken, orderId }) => {
  const orderSummary = await getOrderSummary({ orderId, accessToken });
  logger.info(`Existing order summary '${orderSummary.orderId}' returned`);
  return getContext({
    orderId,
    orderDescription: orderSummary.description,
    sectionsData: orderSummary.sections,
    enableSubmitButton: orderSummary.enableSubmitButton,
  });
};

export const getTaskListPageContext = ({ accessToken, orderId }) => {
  if (orderId === 'neworder') {
    return getNewOrderTaskListPageContext({ orderId });
  }
  return getExistingOrderTaskListPageContext({ accessToken, orderId });
};
