import { getSelectedPrice } from '../api/bapi/getSelectedPrice';
import { destructureDate } from '../common/dateFormatter';
import { getCommencementDate } from './getCommencementDate';
import { sessionKeys } from './sessionHelper';
import { getOrderItems } from '../api/ordapi/getOrderItems';

const updateOrderItemsList = async ({
  req, sessionManager, accessToken, newSelectedRecipients, recipientsUpdated, serviceRecipients,
}) => {
  const newRecipientsOrderItems = [{
    serviceRecipients: [],
  }];
  if (newSelectedRecipients && newSelectedRecipients.length > 0) {
    const commencementDate = await getCommencementDate({
      req,
      sessionManager,
      accessToken,
    });
    newSelectedRecipients.forEach((recipient) => {
      const serviceRecipientNew = {
        name: recipient.name,
        odsCode: recipient.odsCode,
        deliveryDate: commencementDate,
      };
      newRecipientsOrderItems[0].serviceRecipients.push(serviceRecipientNew);
    });
  }
  recipientsUpdated.forEach((recipient) => {
    serviceRecipients.forEach((serviceRecipient) => {
      if (serviceRecipient && recipient.odsCode === serviceRecipient.odsCode) {
        newRecipientsOrderItems[0].serviceRecipients.push(serviceRecipient);
      }
    });
  });
  return newRecipientsOrderItems;
};

const checkAndUpdateNewOrderItems = async ({
  req, sessionManager, accessToken, orderItems,
}) => {
  const selectedRecipientsUpdated = sessionManager.getFromSession({
    req, key: sessionKeys.selectedRecipients,
  });
  if (selectedRecipientsUpdated && selectedRecipientsUpdated.length > 0) {
    const recipientsList = sessionManager.getFromSession({
      req, key: sessionKeys.recipients,
    });
    const recipientsUpdated = selectedRecipientsUpdated.map(
      (selectedRecipient) => recipientsList
        .find((recipient) => recipient.odsCode === selectedRecipient),
    );
    const { serviceRecipients } = orderItems[0];
    const newSelectedRecipients = recipientsUpdated
      .filter(({ odsCode: code1 }) => !serviceRecipients
        .some(({ odsCode: code2 }) => code2 === code1));

    const newRecipientsOrderItems = await updateOrderItemsList({
      req,
      sessionManager,
      accessToken,
      orderItems,
      newSelectedRecipients,
      recipientsUpdated,
      serviceRecipients,
    });
    return newRecipientsOrderItems;
  }
  return [];
};

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
    const selectedQuantity = sessionManager.getFromSession({
      req, key: sessionKeys.selectedQuantity,
    });
    const selectEstimationPeriod = sessionManager.getFromSession({
      req, key: sessionKeys.selectEstimationPeriod,
    });
    const formData = {
      deliveryDate: [{
        'deliveryDate-day': day,
        'deliveryDate-month': month,
        'deliveryDate-year': year,
      }],
      price: selectedPrice.price,
      quantity: selectedQuantity,
      selectEstimationPeriod,
    };
    return {
      itemId,
      itemName,
      catalogueSolutionId,
      selectedPrice,
      formData,
      recipients,
      selectedRecipients,
    };
  }

  const orderItems = await getOrderItems({ orderId, orderItemId, accessToken });
  const serviceRecipients = [];
  const filteredServiceRecipients = orderItems[0].serviceRecipients;
  filteredServiceRecipients.forEach(
    (serviceRecipient) => {
      serviceRecipients.push(`${serviceRecipient.name} (${serviceRecipient.odsCode})`);
    },
  );

  const itemId = orderItems[0].catalogueItemId;
  const itemName = orderItems[0].catalogueItemName;
  const catalogueSolutionId = orderItems[0].catalogueItemId;
  const selectedPrice = {
    price: orderItems[0].price,
    itemUnit: orderItems[0].itemUnit,
    timeUnit: orderItems[0].timeUnit,
    type: orderItems[0].type,
    provisioningType: orderItems[0].provisioningType,
    currencyCode: orderItems[0].currencyCode,
  };

  const formData = {
    deliveryDate: [],
    quantity: [],
    price: selectedPrice.price,
  };

  const recipients = [];
  const selectedRecipients = [];

  const newRecipientsOrderItems = await checkAndUpdateNewOrderItems({
    req, sessionManager, accessToken, orderItems, serviceRecipients,
  });

  const updatedOrderItems = newRecipientsOrderItems && newRecipientsOrderItems.length > 0
    ? newRecipientsOrderItems
    : orderItems;

  updatedOrderItems.forEach((orderItem) => {
    orderItem.serviceRecipients.forEach((serviceRecipient) => {
      const [day, month, year] = destructureDate(serviceRecipient.deliveryDate);
      formData.deliveryDate.push({
        'deliveryDate-year': year,
        'deliveryDate-month': month,
        'deliveryDate-day': day,
      });
      formData.quantity.push(serviceRecipient.quantity);

      const catalogueIds = [];
      if (catalogueIds.includes(orderItem.catalogueItemId)) {
        return;
      }
      recipients.push(serviceRecipient);
      selectedRecipients.push(serviceRecipient.odsCode);
    });
  });

  return {
    itemId,
    itemName,
    catalogueSolutionId,
    selectedPrice,
    formData,
    recipients,
    selectedRecipients,
  };
};
