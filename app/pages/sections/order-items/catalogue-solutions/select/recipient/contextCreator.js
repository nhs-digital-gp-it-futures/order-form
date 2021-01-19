import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateRecipientOptions = ({ recipients, selectedRecipientId }) => {
  const recipientsMap = recipients.map((recipient) => ({
    value: recipient.odsCode,
    text: `${recipient.name} (${recipient.odsCode})`,
    checked: selectedRecipientId === recipient.odsCode ? true : undefined,
  }));
  return recipientsMap;
};

const generateQuestionsContext = ({ recipients, selectedRecipientId }) => (
  manifest.questions.map((question) => ({
    ...question,
    options: generateRecipientOptions({ recipients, selectedRecipientId }),
  }))
);

export const getContext = ({
  orderId, solutionName, recipients, selectedRecipientId,
}) => ({
  ...manifest,
  title: `${manifest.title} ${solutionName}`,
  questions: recipients && generateQuestionsContext({ recipients, selectedRecipientId }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price`,
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    solutionName: params.solutionName,
    recipients: params.recipients,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
