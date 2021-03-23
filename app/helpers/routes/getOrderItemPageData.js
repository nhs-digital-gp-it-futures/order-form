import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { getOrderItem } from '../api/ordapi/getOrderItem';
import { destructureDate } from '../common/dateFormatter';
import { sessionKeys } from './sessionHelper';

export const getOrderItemPageData = async ({
  req, sessionManager, accessToken, orderId, orderItemId,
}) => {
  const catalogueSolutionId = sessionManager.getFromSession({
    req, key: sessionKeys.selectedCatalogueSolutionId,
  });

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

    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });

    return {
      itemId,
      itemName,
      catalogueSolutionId,
      serviceRecipientId,
      serviceRecipientName,
      selectedPrice,
      formData: {
        price: selectedPrice.price,
      },
    };
  }

  const orderItem = await getOrderItem({ orderId, catalogueSolutionId, accessToken });
  const itemId = orderItem.catalogueItemId;
  const itemName = orderItem.catalogueItemName;

  const selectedPrice = {
    currencyCode: orderItem.currencyCode,
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
    itemId, itemName, selectedPrice, formData,
  };
};
