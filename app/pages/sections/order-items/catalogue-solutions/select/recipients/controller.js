import { baseUrl } from '../../../../../../config';
import { getContext, getErrorContext } from './contextCreator';

export const getSelectSolutionPriceEndpoint = (orderId, orderItemId, odsCode) => `/organisation/${odsCode}/${orderId}/catalogue-solutions/${orderItemId}`;

export const getSelectStatus = ({ selectStatus, selectedRecipients, serviceRecipients }) => {
  if (selectStatus) {
    return selectStatus;
  }

  if (selectedRecipients
    && serviceRecipients
    && selectedRecipients.length === serviceRecipients.length) {
    return 'select';
  }

  return false;
};

export const getServiceRecipientsContext = async ({
  orderId, itemName, selectStatus, serviceRecipients, selectedRecipients, solutionPrices,
  manifest, orderType, odsCode,
}) => getContext({
  orderId,
  itemName,
  serviceRecipientsData: serviceRecipients,
  selectedRecipientIdsData: selectedRecipients,
  selectStatus,
  solutionPrices,
  manifest,
  orderType,
  odsCode,
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

export const setContextIfBackFromCatalogueSolutionEdit = (req, context, orderId, odsCode) => {
  let orderItemId = req.body.orderItemId || req.query.orderItemId;
  if (orderItemId) {
    context.backLinkHref = `${baseUrl}${getSelectSolutionPriceEndpoint(orderId, orderItemId, odsCode)}`;
    context.orderItemId = orderItemId;

    return;
  }

  const { referer } = req.headers;
  orderItemId = referer.split('/').pop();

  if (referer.endsWith(getSelectSolutionPriceEndpoint(orderId, orderItemId, odsCode))) {
    context.backLinkHref = referer;
    context.orderItemId = orderItemId;
  }
};
