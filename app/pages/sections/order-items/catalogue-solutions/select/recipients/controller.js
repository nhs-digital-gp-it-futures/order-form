import { baseUrl } from '../../../../../../config';
import { getContext, getErrorContext } from './contextCreator';

export const getSelectSolutionPriceEndpoint = (orderId, orderItemId) => `/organisation/${orderId}/catalogue-solutions/${orderItemId}`;

export const getServiceRecipientsContext = async ({
  orderId, itemName, selectStatus, serviceRecipients, selectedRecipients, solutionPrices,
  manifest, orderType,
}) => getContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: selectedRecipients,
  selectStatus,
  solutionPrices,
  manifest,
  orderType,
});

export const getServiceRecipientsErrorPageContext = async ({
  orderId,
  itemName,
  selectStatus,
  serviceRecipients,
  selectedRecipients,
  solutionPrices,
  validationErrors,
  manifest,
}) => getErrorContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: selectedRecipients,
  selectStatus,
  solutionPrices,
  validationErrors,
  manifest,
});

export const setContextIfBackFromCatalogueSolutionEdit = (req, context, orderId) => {
  let orderItemId = req.body.orderItemId || req.query.orderItemId;
  if (orderItemId) {
    context.backLinkHref = `${baseUrl}${getSelectSolutionPriceEndpoint(orderId, orderItemId)}`;
    context.orderItemId = orderItemId;

    return;
  }

  const { referer } = req.headers;
  orderItemId = referer.split('/').pop();

  if (referer.endsWith(getSelectSolutionPriceEndpoint(orderId, orderItemId))) {
    context.backLinkHref = referer;
    context.orderItemId = orderItemId;
  }
};
