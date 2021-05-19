import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { getOrderItem } from '../api/ordapi/getOrderItem';
import { destructureDate } from '../common/dateFormatter';
import { sessionKeys } from './sessionHelper';

export const getOrderItemPageData = async ({
  req, sessionManager, accessToken, orderId, catalogueItemId,
}) => {
  const catalogueSolutionId = sessionManager.getFromSession({
    req, key: sessionKeys.selectedCatalogueSolutionId,
  });

  if (catalogueItemId === 'neworderitem') {
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

    selectedPrice.listPrice = selectedPrice.price;

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

  const orderItem = await getOrderItem({ orderId, catalogueItemId, accessToken });
  const itemId = orderItem.catalogueItemId;
  const itemName = orderItem.catalogueItemName;
  const serviceRecipientId = orderItem.serviceRecipients[0].odsCode;
  const serviceRecipientName = orderItem.serviceRecipients[0].name;
  const selectedListPrice = await getSelectedPrice(
    { selectedPriceId: orderItem.priceId, accessToken },
  );
  const selectedPrice = {
    listPrice: selectedListPrice.price,
    priceId: orderItem.priceId,
    currencyCode: orderItem.currencyCode,
    price: orderItem.price,
    itemUnit: orderItem.itemUnit,
    timeUnit: orderItem.timeUnit,
    type: orderItem.type,
    provisioningType: orderItem.provisioningType,
  };

  const [day, month, year] = destructureDate(orderItem.serviceRecipients[0].deliveryDate);
  const formData = {
    'deliveryDate-year': year,
    'deliveryDate-month': month,
    'deliveryDate-day': day,
    quantity: orderItem.serviceRecipients[0].quantity,
    selectEstimationPeriod: orderItem.estimationPeriod,
    price: orderItem.price,
  };

  return {
    itemId,
    itemName,
    serviceRecipientId,
    serviceRecipientName,
    selectedPrice,
    formData,
    catalogueSolutionId,
  };
};

export const getOrderItemAdditionalServicesPageData = async ({
  req, sessionManager, accessToken,
}) => {
  const deliveryDate = sessionManager.getFromSession({
    req, key: sessionKeys.plannedDeliveryDate,
  });

  const selectedPriceId = sessionManager.getFromSession({
    req, key: sessionKeys.selectedPriceId,
  });
  const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });

  const [day, month, year] = destructureDate(deliveryDate);
  const formData = {
    deliveryDate: [{
      'deliveryDate-day': day,
      'deliveryDate-month': month,
      'deliveryDate-year': year,
    }],
    price: selectedPrice.price,
  };

  const itemName = sessionManager.getFromSession({
    req, key: sessionKeys.selectedItemName,
  });

  const recipients = sessionManager.getFromSession({
    req, key: sessionKeys.recipients,
  });

  const selectedRecipients = sessionManager.getFromSession({
    req, key: sessionKeys.selectedRecipients,
  });

  return {
    formData,
    itemName,
    recipients,
    selectedPrice,
    selectedRecipients,
  };
};

export const getOrderItemRecipientsPageData = async ({
  req, sessionManager, accessToken, orderId, catalogueItemId,
}) => {
  const catalogueSolutionId = sessionManager.getFromSession({
    req, key: sessionKeys.selectedCatalogueSolutionId,
  });
  const recipients = sessionManager.getFromSession({
    req, key: sessionKeys.recipients,
  });

  if (catalogueItemId === 'neworderitem') {
    const itemId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemId,
    });
    const itemName = sessionManager.getFromSession({
      req, key: sessionKeys.selectedItemName,
    });
    const selectedPriceId = sessionManager.getFromSession({
      req, key: sessionKeys.selectedPriceId,
    });
    const selectedPrice = await getSelectedPrice({ selectedPriceId, accessToken });
    const selectedRecipients = sessionManager.getFromSession({
      req, key: sessionKeys.selectedRecipients,
    });
    const deliveryDate = sessionManager.getFromSession({
      req, key: sessionKeys.plannedDeliveryDate,
    });

    const [day, month, year] = destructureDate(deliveryDate);
    const formData = {
      deliveryDate: [{
        'deliveryDate-day': day,
        'deliveryDate-month': month,
        'deliveryDate-year': year,
      }],
      price: selectedPrice.price,
    };

    return {
      itemId,
      itemName,
      catalogueSolutionId,
      deliveryDate,
      recipients,
      selectedPrice,
      selectedRecipients,
      formData,
    };
  }

  const orderItem = await getOrderItem({ orderId, catalogueItemId, accessToken });
  const itemId = orderItem.catalogueItemId;
  const itemName = orderItem.catalogueItemName;
  const selectedRecipients = orderItem.serviceRecipients;
  const selectedPrice = {
    currencyCode: orderItem.currencyCode,
    price: orderItem.price,
    itemUnit: orderItem.itemUnit,
    timeUnit: orderItem.timeUnit,
    type: orderItem.type,
    provisioningType: orderItem.provisioningType,
  };

  const [day, month, year] = destructureDate(orderItem.serviceRecipients[0].deliveryDate);
  const formData = {
    'deliveryDate-year': year,
    'deliveryDate-month': month,
    'deliveryDate-day': day,
    quantity: orderItem.serviceRecipients[0].quantity,
    selectEstimationPeriod: orderItem.estimationPeriod,
    price: orderItem.price,
  };

  return {
    itemId,
    itemName,
    selectedRecipients,
    recipients,
    selectedPrice,
    formData,
    catalogueSolutionId,
  };
};
