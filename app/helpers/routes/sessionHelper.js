export const getFromSessionOrApi = async ({
  sessionData,
  sessionManager,
  apiCall,
}) => {
  const savedResult = sessionManager.getFromSession(sessionData);
  if (savedResult) {
    return savedResult;
  }

  const result = await apiCall();
  sessionManager.saveToSession({ ...sessionData, value: result });

  return result;
};
