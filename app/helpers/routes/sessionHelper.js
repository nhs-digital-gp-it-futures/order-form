export const sessionKeys = {
  additionalServices: 'additionalServices',
  additionalServicePrices: 'additionalServicePrices',
  associatedServicePrices: 'associatedServicePrices',
  associatedServices: 'associatedServices',
  commencementDate: 'commencementDate',
  fundingSource: 'fundingSource',
  orderDescription: 'orderDescription',
  orderItemPageData: 'orderItemPageData',
  recipients: 'recipients',
  plannedDeliveryDate: 'plannedDeliveryDate',
  selectedItemId: 'selectedItemId',
  selectedCatalogueSolutionId: 'selectedCatalogueSolutionId',
  selectedItemName: 'selectedItemName',
  selectedPriceId: 'selectedPriceId',
  selectedRecipientId: 'selectedRecipientId',
  selectedRecipientName: 'selectedRecipientName',
  selectedRecipients: 'selectedRecipients',
  selectedSupplier: 'selectedSupplier',
  solutionPrices: 'solutionPrices',
  solutions: 'solutions',
  suppliersFound: 'suppliersFound',
};

export const getFromSessionOrApi = async ({
  sessionData,
  sessionManager,
  apiCall,
}) => {
  const savedValue = sessionManager.getFromSession(sessionData);
  if (savedValue) {
    return savedValue;
  }

  const value = await apiCall();
  sessionManager.saveToSession({ ...sessionData, value });

  return value;
};

export const clearSession = async ({
  req,
  sessionManager,
}) => {
  sessionManager.clearFromSession({
    req,
    keys: Object.values(sessionKeys),
  });
};
