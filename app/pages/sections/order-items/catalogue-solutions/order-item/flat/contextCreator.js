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
}) => ({
  ...commonManifest,
  title: `${commonManifest.title} ${itemName} for ${orderId}`,
  questions: selectedPriceManifest && generateQuestions({
    questions: selectedPriceManifest.questions,
    formData,
  }),
  description: selectedPrice.provisioningType === 'Declarative' ? selectedPriceManifest.description.replace('[price]', selectedPrice.price) : selectedPriceManifest.description,
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients/date`,
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
    formData: params.formData,
    errorMap,
  });
  const errorSummary = generateErrorSummary({ errorMap });
  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
