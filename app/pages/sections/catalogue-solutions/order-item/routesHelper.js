import {
  getSelectedPrice,
  getSolution,
  getOrderItem,
} from './controller';
import { destructureDate } from '../../../../helpers/dateFormatter';

export const getPageData = async ({
  req, sessionManager, accessToken, orderId, orderItemId,
}) => {
  if (orderItemId === 'newsolution') {
    const selectedSolutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const solutionName = (await getSolution({ solutionId: selectedSolutionId, accessToken })).name;
    const serviceRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });
    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const formData = { price: selectedPrice.price };
    return {
      solutionName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
    };
  }

  const orderItem = await getOrderItem({ orderId, orderItemId, accessToken });
  const solutionName = orderItem.catalogueItemName;
  const serviceRecipientId = orderItem.serviceRecipient.odsCode;
  const serviceRecipientName = orderItem.serviceRecipient.name;
  const selectedPrice = {
    price: orderItem.price,
    itemUnit: orderItem.itemUnit,
    type: orderItem.type,
    provisioningType: orderItem.provisioningType,
  };

  const [day, month, year] = destructureDate(orderItem.deliveryDate);
  const formData = {
    'deliveryDate-year': year,
    'deliveryDate-month': month,
    'deliveryDate-day': day,
    quantity: orderItem.quantity,
    selectEstimationPeriod: orderItem.estimationPeriod,
    price: orderItem.price,
  };

  return {
    solutionName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
  };
};
