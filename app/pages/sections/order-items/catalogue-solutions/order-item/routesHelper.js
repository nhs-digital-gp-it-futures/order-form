import {
  getSelectedPrice,
  getOrderItem,
} from './controller';
import { destructureDate } from '../../../../../helpers/common/dateFormatter';
import { formatDecimal } from '../../../../../helpers/common/priceFormatter';

export const getPageData = async ({
  req, sessionManager, accessToken, orderId, orderItemId,
}) => {
  if (orderItemId === 'neworderitem') {
    const itemId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const itemName = sessionManager.getFromSession({ req, key: 'selectedItemName' });
    const serviceRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });

    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const formData = { price: formatDecimal(selectedPrice.price) };

    return {
      itemId, itemName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
    };
  }

  const orderItem = await getOrderItem({ orderId, orderItemId, accessToken });
  const itemId = orderItem.catalogueItemId;
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
    price: formatDecimal(orderItem.price),
  };

  return {
    itemId,
    itemName: solutionName,
    serviceRecipientId,
    serviceRecipientName,
    selectedPrice,
    formData,
  };
};
