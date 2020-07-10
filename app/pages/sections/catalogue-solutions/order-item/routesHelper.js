import {
  getSelectedPrice,
  getSolution,
  getOrderItem,
} from './controller';
import { destructureDate } from '../../../../helpers/dateFormatter';
import { formatDecimal } from '../../../../helpers/priceFormatter';

export const getPageData = async ({
  req, sessionManager, accessToken, orderId, orderItemId,
}) => {
  if (orderItemId === 'newsolution') {
    const solutionId = sessionManager.getFromSession({ req, key: 'selectedSolutionId' });
    const serviceRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });

    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const solutionName = (await getSolution({ solutionId, accessToken })).name;
    const formData = { price: formatDecimal(selectedPrice.price) };

    return {
      solutionId, solutionName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
    };
  }

  const orderItem = await getOrderItem({ orderId, orderItemId, accessToken });
  const solutionId = orderItem.catalogueItemId;
  const solutionName = orderItem.catalogueItemName;
  const serviceRecipientId = orderItem.serviceRecipient.odsCode;
  const serviceRecipientName = orderItem.serviceRecipient.name;
  const selectedPrice = {
    price: orderItem.price,
    itemUnit: orderItem.itemUnit,
    timeUnit: orderItem.timeUnit,
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
    solutionId, solutionName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
  };
};
