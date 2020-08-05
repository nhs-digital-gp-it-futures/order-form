export const sessionKeys = {
  orderDescription: 'orderDescription',
  selectedSupplier: 'selectedSupplier',
  suppliersFound: 'suppliersFound',
  selectedItemId: 'selectedItemId',
  selectedItemName: 'selectedItemName',
  selectedRecipientId: 'selectedRecipientId',
  selectedRecipientName: 'selectedRecipientName',
  selectedPriceId: 'selectedPriceId',
  selectedCatalogueSolutionId: 'selectedCatalogueSolutionId',
  orderItemPageData: 'orderItemPageData',
  additionalServices: 'additionalServices',
  additionalServicePrices: 'additionalServicePrices',
  recipients: 'recipients',
  associatedServices: 'associatedServices',
  associatedServicePrices: 'associatedServicePrices',
  solutions: 'solutions',
  solutionPrices: 'solutionPrices',
  fundingSource: 'fundingSource',
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
