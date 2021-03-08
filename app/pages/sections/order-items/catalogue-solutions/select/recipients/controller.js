import { baseUrl } from '../../../../../../config';
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
  if (req.body.orderItemId || req.query.orderItemId) {
    let { orderItemId } = req.body;
    if (!orderItemId) {
      orderItemId = req.query.orderItemId;
    }

    context.backLinkHref = `${baseUrl}${getSelectSolutionPriceEndpoint(orderId, orderItemId)}`;
    context.orderItemId = orderItemId;

    return;
  }

  const { referer } = req.headers;
  const orderItemId = referer.split('/').pop();

  if (referer.endsWith(getSelectSolutionPriceEndpoint(orderId, orderItemId))) {
    context.backLinkHref = referer;
    context.orderItemId = orderItemId;
  }
};

export const validateSolutionRecipientsForm = ({ data }) => {
  if (data.length > 0) {
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
