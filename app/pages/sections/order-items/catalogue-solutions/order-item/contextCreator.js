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
  selectedPrice,
  selectedRecipients,
  errorMap,
  catalogueItemExists,
}) => {
  const errorMessages = errorMap && (errorMap.quantity || errorMap.deliveryDate)
    ? ((errorMap.quantity || {}).errorMessages || [''])
      .concat((errorMap.deliveryDate || {}).errorMessages) : undefined;
  const newItemBackLink = selectedPrice.provisioningType === 'Patient'
    ? `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients/date`
    : `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/${selectedPrice.type.toLowerCase()}/${selectedPrice.provisioningType.toLowerCase()}`;
  const existingItemBackLink = catalogueItemExists !== undefined
    ? `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/`
    : `${baseUrl}/organisation/${orderId}/catalogue-solutions`;

  return {
    ...commonManifest,
    title: `${solutionName} ${commonManifest.title} ${orderId}`,
    questions: selectedPriceManifest && generateQuestions({
      questions: selectedPriceManifest.questions,
      formData,
      errorMap,
      unit: selectedPrice.timeUnit
        ? `${selectedPrice.itemUnit.description} ${selectedPrice.timeUnit.description}`
        : selectedPrice.itemUnit.description,
    }),
    solutionTable: selectedPriceManifest && generateSolutionTable({
      solutionTable: selectedPriceManifest.solutionTable,
      deliveryDate: formData.deliveryDate,
      recipients: selectedRecipients.map(
        (selectedRecipient) => recipients.find(
          (recipient) => recipient.odsCode === selectedRecipient,
        ),
      ),
      quantity: formData.quantity,
      errorMessages,
    }),
    editButton: {
      text: commonManifest.editButton.text,
      altText: orderItemId === 'neworderitem' ? commonManifest.editButton.altText : '',
      href: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients`,
      disabled: orderItemId === 'neworderitem',
    },
    deleteButton: {
      text: commonManifest.deleteButton.text,
      altText: orderItemId === 'neworderitem' ? commonManifest.deleteButton.altText : '',
      href: commonManifest.deleteButton.href,
      disabled: orderItemId === 'neworderitem',
    },
    backLinkHref: orderItemId === 'neworderitem' ? newItemBackLink : existingItemBackLink,
  };
};

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
    recipients: params.recipients,
    selectedRecipients: params.selectedRecipients,
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
