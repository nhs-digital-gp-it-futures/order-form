import { getContext, getErrorContext } from './contextCreator';

export const getRecipientPageContext = (params) => getContext(params);

export const getRecipientErrorPageContext = (params) => getErrorContext(params);

export const validateRecipientForm = ({ data }) => {
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

export const getServiceRecipientName = ({ serviceRecipientId, recipients }) => (
  recipients.find((recipient) => serviceRecipientId === recipient.odsCode).name
);
