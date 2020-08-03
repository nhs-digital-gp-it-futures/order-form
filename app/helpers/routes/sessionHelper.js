export const sessionKeys = {
  orderDescription: 'orderDescription',
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
