import { getCatalogueItem } from '../../../../../helpers/api/bapi/getCatalogueItem';
import { getSelectedPrice } from '../../../../../helpers/api/bapi/getSelectedPrice';
import { getOrderItem } from '../../../../../helpers/api/ordapi/getOrderItem';
import { formatDecimal } from '../../../../../helpers/common/priceFormatter';

export const getPageData = async ({
  req, sessionManager, accessToken, orderId, orderItemId,
}) => {
  if (orderItemId === 'neworderitem') {
    const itemId = sessionManager.getFromSession({ req, key: 'selectedItemId' });
    const serviceRecipientId = sessionManager.getFromSession({ req, key: 'selectedRecipientId' });
    const serviceRecipientName = sessionManager.getFromSession({ req, key: 'selectedRecipientName' });
    const selectedPriceId = sessionManager.getFromSession({ req, key: 'selectedPriceId' });

    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const itemName = (await getCatalogueItem({ itemId, accessToken })).name;
    const formData = { price: formatDecimal(selectedPrice.price) };

    return {
      itemId, itemName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
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

  const formData = {
    quantity: orderItem.quantity,
    selectEstimationPeriod: orderItem.estimationPeriod,
    price: formatDecimal(orderItem.price),
  };

  return {
    itemId, itemName, serviceRecipientId, serviceRecipientName, selectedPrice, formData,
  };
};
