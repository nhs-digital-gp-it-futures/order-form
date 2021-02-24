import { getContext, getErrorContext } from './contextCreator';

export const getSelectSolutionPriceEndpoint = (orderId, orderItemId) => `/organisation/${orderId}/catalogue-solutions/${orderItemId}`;

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

export const getServiceRecipientsErrorPageContext = async ({
  orderId,
  itemName,
  selectStatus,
  serviceRecipients,
  selectedRecipients,
  solutionPrices,
  validationErrors,
}) => getErrorContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: selectedRecipients,
  selectStatus,
  solutionPrices,
  validationErrors,
});

export const setContextIfBackFromCatalogueSolutionEdit = (req, context, orderId) => {
  const { referer } = req.headers;
  const orderItemId = referer.split('/').pop();

  const endpoint = getSelectSolutionPriceEndpoint(orderId, orderItemId);
  if (referer.endsWith(endpoint)) {
    context.backLinkHref = referer;
    context.orderItemId = orderItemId;
  }
};

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
