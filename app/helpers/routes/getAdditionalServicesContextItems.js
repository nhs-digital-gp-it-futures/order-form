import { getServiceRecipients } from './getServiceRecipients';
import { sessionKeys } from './sessionHelper';

export const getAdditionalServicesContextItems = async ({
  req, sessionManager, accessToken, logger, odsCode,
}) => {
  sessionManager.clearFromSession({ req, keys: [sessionKeys.recipients] });

  const serviceRecipients = await getServiceRecipients({
    req,
    accessToken,
    sessionManager,
    logger,
    odsCode,
  });

  const selectedRecipients = sessionManager.getFromSession({
    req, key: sessionKeys.selectedRecipients,
  });

  const additionalServicePrices = sessionManager.getFromSession({
    req, key: sessionKeys.additionalServicePrices,
  });

  const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });

  return {
    serviceRecipients, selectedRecipients, additionalServicePrices, itemName,
  };
};

export const getAdditionalServicesContextItemsFromSession = ({ req, sessionManager }) => {
  const serviceRecipients = sessionManager.getFromSession({ req, key: sessionKeys.recipients });

  const selectedRecipients = sessionManager.getFromSession({
    req, key: sessionKeys.selectedRecipients,
  });

  const additionalServicePrices = sessionManager.getFromSession({
    req, key: sessionKeys.additionalServicePrices,
  });

  const itemName = sessionManager.getFromSession({ req, key: sessionKeys.selectedItemName });

  return {
    serviceRecipients, selectedRecipients, additionalServicePrices, itemName,
  };
};

export const getAdditionalServicesPriceContextItemsFromSession = ({ req, sessionManager }) => {
  const itemName = sessionManager.getFromSession({
    req, key: sessionKeys.selectedItemName,
  });
  const selectedPrice = sessionManager.getFromSession({
    req, key: sessionKeys.additionalServiceSelectedPrice,
  });
  const quantity = sessionManager.getFromSession({
    req, key: sessionKeys.selectedQuantity,
  });
  const estimationPeriod = sessionManager.getFromSession({
    req, key: sessionKeys.selectEstimationPeriod,
  });
  const formData = {
    quantity,
    selectEstimationPeriod: estimationPeriod,
  };

  return {
    formData, itemName, selectedPrice,
  };
};
