import { backLinkHref, getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';

export const getAdditionalServiceRecipientPageContext = (params) => getContext(params);

export const getAdditionalServiceRecipientErrorPageContext = (params) => getErrorContext(params);

export const getAdditionalServicePriceEndpoint = (orderId, orderItemId, odsCode) => `/organisation/${odsCode}/order/${orderId}/additional-services/${orderItemId}`;

export const validateAdditionalServiceRecipientForm = ({ data }) => {
  if (data.selectRecipient && data.selectRecipient.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectRecipient',
      id: 'SelectRecipientRequired',
    },
  ];
  return { success: false, errors };
};

export const getAdditionalServiceRecipientName = ({ serviceRecipientId, recipients }) => (
  recipients.find((recipient) => serviceRecipientId === recipient.odsCode).name
);

// eslint-disable-next-line max-len
export const getBackLinkHref = (req, additionalServicePrices, orderId, odsCode) => backLinkHref(req, additionalServicePrices, orderId, odsCode);

export const setContextIfBackFromAdditionalServiceEdit = (req, context, orderId, odsCode) => {
  let orderItemId = req.body.orderItemId || req.query.orderItemId;
  if (orderItemId) {
    context.backLinkHref = `${baseUrl}${getAdditionalServicePriceEndpoint(orderId, orderItemId, odsCode)}`;
    context.orderItemId = orderItemId;

    return;
  }

  const { referer } = req.headers;
  orderItemId = referer ? referer.split('/').pop() : '';

  if (referer && referer.endsWith(
    getAdditionalServicePriceEndpoint(orderId, orderItemId, odsCode),
  )) {
    context.backLinkHref = referer;
    context.orderItemId = orderItemId;
  }
};
