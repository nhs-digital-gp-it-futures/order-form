import { backLinkHref, getContext, getErrorContext } from './contextCreator';

export const getAdditionalServiceRecipientPageContext = (params) => getContext(params);

export const getAdditionalServiceRecipientErrorPageContext = (params) => getErrorContext(params);

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
export const getBackLinkHref = (additionalServicePrices, orderId) => backLinkHref(additionalServicePrices, orderId);
