import { baseUrl } from '../../../../../config';
import { generateErrorMap } from '../../../../../helpers/contextCreators/generateErrorMap';
import { generateQuestions } from '../../../../../helpers/contextCreators/generateQuestions';
import { generateErrorSummary } from '../../../../../helpers/contextCreators/generateErrorSummary';
import { generateSolutionTable } from '../../../../../helpers/contextCreators/generateSolutionTable';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  orderItemId,
  solutionName,
  formData,
  recipients,
  selectedRecipients,
  errorMap,
}) => ({
  ...commonManifest,
  title: `${solutionName} ${commonManifest.title} ${orderId}`,
  questions: selectedPriceManifest && generateQuestions({
    questions: selectedPriceManifest.questions,
    formData,
    errorMap,
  }),
  solutionTable: selectedPriceManifest && generateSolutionTable({
    solutionTable: selectedPriceManifest.solutionTable,
    deliveryDate: formData.deliveryDate,
    recipients: selectedRecipients.map(
      selectedRecipient => recipients.find(recipient => recipient.odsCode === selectedRecipient),
    ),
    practiceSize: formData.practiceSize,
    errorMap,
  }),
  editButton: {
    text: commonManifest.editButton.text,
    href: commonManifest.editButton.href,
    disabled: orderItemId === 'neworderitem',
  },
  deleteButton: {
    text: commonManifest.deleteButton.text,
    href: commonManifest.deleteButton.href,
    disabled: orderItemId === 'neworderitem',
  },
  backLinkHref: orderItemId === 'neworderitem' ? `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients/date`
    : `${baseUrl}/organisation/${orderId}/catalogue-solutions`,
});

export const getErrorContext = (params) => {
  const errorMap = generateErrorMap({
    validationErrors: params.validationErrors,
    errorMessagesFromManifest: params.selectedPriceManifest.errorMessages,
  });

  const contextWithErrors = getContext({
    commonManifest: params.commonManifest,
    selectedPriceManifest: params.selectedPriceManifest,
    orderId: params.orderId,
    orderItemId: params.orderItemId,
    solutionName: params.solutionName,
    serviceRecipientName: params.serviceRecipientName,
    odsCode: params.selectedRecipientId,
    selectedPrice: params.selectedPrice,
    formData: params.formData,
    errorMap,
  });

  const errorSummary = generateErrorSummary({ errorMap });

  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
