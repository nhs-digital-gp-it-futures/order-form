import { getContext, getErrorContext } from './contextCreator';

export const getServiceRecipientsContext = async ({
  orderId, itemName, selectStatus, serviceRecipients,
}) => getContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: [],
  selectStatus,
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
  orderId, itemName, selectStatus, serviceRecipients, validationErrors,
}) => getErrorContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: [],
  selectStatus,
  validationErrors,
});
