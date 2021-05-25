import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

export const backLinkHref = (req, additionalServicePrices, orderId, odsCode) => {
  const { referer } = req.headers || {};
  const orderItemId = referer ? referer.split('/').pop() : '';
  if (referer && referer.endsWith(`${orderId}/additional-services/${orderItemId}`)) {
    return referer;
  }

  return ((additionalServicePrices || {}).prices || {}).length === 1
    ? `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service`
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price`;
};

const generateRecipientOptions = ({ recipients, selectedAdditionalRecipientId }) => {
  const recipientsMap = recipients.map((recipient) => ({
    value: recipient.odsCode,
    text: `${recipient.name} (${recipient.odsCode})`,
    checked: selectedAdditionalRecipientId === recipient.odsCode ? true : undefined,
  }));
  return recipientsMap;
};

const generateQuestionsContext = ({ recipients, selectedAdditionalRecipientId }) => (
  manifest.questions.map((question) => ({
    ...question,
    options: generateRecipientOptions({ recipients, selectedAdditionalRecipientId }),
  }))
);

export const getContext = ({
  orderId, itemName, recipients, selectedAdditionalRecipientId, additionalServicePrices, odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${itemName}`,
  questions: recipients && generateQuestionsContext({ recipients, selectedAdditionalRecipientId }),
  backLinkHref: backLinkHref({}, additionalServicePrices, orderId, odsCode),
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    itemName: params.itemName,
    recipients: params.recipients,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
