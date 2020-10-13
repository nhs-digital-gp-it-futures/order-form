import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { getOrderItem } from '../api/ordapi/getOrderItem';
import { formatDecimal } from '../common/priceFormatter';
import { destructureDate } from '../common/dateFormatter';
import { sessionKeys } from './sessionHelper';

export const getOrderItemPageData = async ({
  req, sessionManager, accessToken, orderId, orderItemId,
}) => {
  if (orderItemId === 'neworderitem') {
    const itemId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const serviceRecipientId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipientId,
    });
    const serviceRecipientName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipientName,
    });
    const selectedPriceId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedPriceId,
    });
    const catalogueSolutionId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedCatalogueSolutionId,
    });
    const deliveryDate = sessionManager.getFromSession({
      req, key: sessionKeys.plannedDeliveryDate,
    });
    const recipients = sessionManager.getFromSession({
      req, key: sessionKeys.recipients,
    });
    const selectedRecipients = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipients,
    });

    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const [day, month, year] = destructureDate(deliveryDate);
    const formData = {
      deliveryDate: {
        day,
        month,
        year,
      },
      price: formatDecimal(selectedPrice.price),
    };

    return {
      itemId,
      itemName,
      catalogueSolutionId,
      serviceRecipientId,
      serviceRecipientName,
      selectedPrice,
      formData,
      recipients,
      selectedRecipients,
    };
  }

  const orderItem = await getOrderItem({ orderId, orderItemId, accessToken });
  const itemId = orderItem.catalogueItemId;
  const itemName = orderItem.catalogueItemName;
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
    itemId, itemName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
  };
};
