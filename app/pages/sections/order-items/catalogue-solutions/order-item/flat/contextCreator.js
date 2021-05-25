import { baseUrl } from '../../../../../../config';
import { generateQuestions } from '../../../../../../helpers/contextCreators/generateQuestions';
import { generateErrorMap } from '../../../../../../helpers/contextCreators/generateErrorMap';
import { generateErrorSummary } from '../../../../../../helpers/contextCreators/generateErrorSummary';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  formData,
  itemName,
  selectedPrice,
  errorMap,
  odsCode,
}) => ({
  ...commonManifest,
  title: `${commonManifest.title} ${itemName} for ${orderId}`,
  questions: selectedPriceManifest && generateQuestions({
    questions: selectedPriceManifest.questions,
    formData,
    errorMap,
  }),
  description: selectedPrice.provisioningType === 'Declarative' ? selectedPriceManifest.description.replace('[price]', selectedPrice.price) : selectedPriceManifest.description,
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price/recipients/date`,
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
    itemName: params.itemName,
    formData: params.formData,
    selectedPrice: params.selectedPrice,
    errorMap,
  });
  const errorSummary = generateErrorSummary({ errorMap });
  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
