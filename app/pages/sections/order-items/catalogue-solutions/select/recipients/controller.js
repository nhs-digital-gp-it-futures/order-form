import { getContext, getErrorContext } from './contextCreator';

export const getServiceRecipientsContext = async ({
  orderId, itemName, selectStatus, serviceRecipients, selectedRecipients, solutionPrices,
}) => getContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: selectedRecipients,
  selectStatus,
  solutionPrices,
});

export const validateSolutionRecipientsForm = ({ data }) => {
  if (Object.keys(data).length > 1) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectSolutionRecipients',
      id: 'SelectSolutionRecipientsRequired',
    },
  ];
  return { success: false, errors };
};

export const getServiceRecipientsErrorPageContext = async ({
  orderId, itemName, selectStatus, serviceRecipients, selectedRecipients, solutionPrices, validationErrors,
}) => getErrorContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: selectedRecipients,
  selectStatus,
  solutionPrices,
  validationErrors,
});
