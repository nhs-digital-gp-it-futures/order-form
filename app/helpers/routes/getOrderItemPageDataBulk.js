import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { formatDecimal } from '../common/priceFormatter';
import { destructureDate } from '../common/dateFormatter';
import { sessionKeys } from './sessionHelper';
import { getOrderItems } from '../api/ordapi/getOrderItems';

export const getOrderItemPageDataBulk = async ({
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
      deliveryDate: [{
        'deliveryDate-day': day,
        'deliveryDate-month': month,
        'deliveryDate-year': year,
      }],
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

  const orderItems = await getOrderItems({ orderId, orderItemId, accessToken });
  const itemId = orderItems[0].catalogueItemId;
  const itemName = orderItems[0].catalogueItemName;
  const catalogueSolutionId = orderItems[0].catalogueItemId;
  const serviceRecipientId = orderItems[0].serviceRecipient.odsCode;
  const serviceRecipientName = orderItems[0].serviceRecipient.name;
  const selectedPrice = {
    price: orderItems[0].price,
    itemUnit: orderItems[0].itemUnit,
    timeUnit: orderItems[0].timeUnit,
    type: orderItems[0].type,
    provisioningType: orderItems[0].provisioningType,
  };

  const formData = {
    deliveryDate: [],
    quantity: [],
    price: formatDecimal(selectedPrice.price),
  };

  const recipients = [];
  const selectedRecipients = [];
  orderItems.forEach((orderItem) => {
    const [day, month, year] = destructureDate(orderItem.deliveryDate);
    formData.deliveryDate.push({
      'deliveryDate-year': year,
      'deliveryDate-month': month,
      'deliveryDate-day': day,
    });
    formData.quantity.push(orderItem.quantity);

    const catalogueIds = [];
    if (catalogueIds.includes(orderItem.catalogueItemId)) {
      return;
    }

    recipients.push(orderItem.serviceRecipient);
    selectedRecipients.push(orderItem.serviceRecipient.odsCode);
  });

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
};
