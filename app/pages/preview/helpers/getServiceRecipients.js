export const getServiceRecipients = (serviceRecipients = []) => {
  const reducer = (dict, serviceRecipient) => (
    {
      ...dict,
      [serviceRecipient.odsCode]: serviceRecipient,
    });

  return serviceRecipients.reduce(reducer, {});
};
