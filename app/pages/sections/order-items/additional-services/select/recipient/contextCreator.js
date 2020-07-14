import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateRecipientOptions = ({ recipients }) => {
  const recipientsMap = recipients.map(recipient => ({
    value: recipient.odsCode,
    text: `${recipient.name} (${recipient.odsCode})`,
  }));
  return recipientsMap;
};

const generateQuestionsContext = ({ recipients }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateRecipientOptions({ recipients }),
  }))
);

export const getContext = ({
  orderId, itemName, recipients,
}) => ({
  ...manifest,
  title: `${manifest.title} ${itemName}`,
  questions: recipients && generateQuestionsContext({ recipients }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`,
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
