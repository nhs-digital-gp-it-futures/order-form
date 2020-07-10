import { baseUrl } from '../../../../config';
import { generateErrorMap } from '../../../../helpers/contextCreators/generateErrorMap';
import { generateQuestions } from '../../../../helpers/contextCreators/generateQuestions';
import { generateErrorSummary } from '../../../../helpers/contextCreators/generateErrorSummary';
import { generateAddPriceTable } from '../../../../helpers/contextCreators/generateAddPriceTable';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  orderItemId,
  solutionName,
  serviceRecipientName,
  odsCode,
  selectedPrice,
  formData,
  errorMap,
}) => ({
  ...commonManifest,
  title: `${solutionName} ${commonManifest.title} ${serviceRecipientName} (${odsCode})`,
  questions: selectedPriceManifest && generateQuestions({
    questions: selectedPriceManifest.questions,
    formData,
    errorMap,
  }),
  addPriceTable: selectedPriceManifest && generateAddPriceTable({
    addPriceTable: selectedPriceManifest.addPriceTable,
    price: formData && formData.price,
    itemUnitDescription: selectedPrice
      && selectedPrice.itemUnit
      && selectedPrice.itemUnit.description,
    timeUnitDescription: selectedPrice
      && selectedPrice.timeUnit
      && selectedPrice.timeUnit.description,
    errorMap,
  }),
  deleteButton: {
    text: commonManifest.deleteButton.text,
    href: commonManifest.deleteButton.href,
    disabled: orderItemId === 'newsolution',
  },
  backLinkHref: orderItemId === 'newsolution' ? `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipient`
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
