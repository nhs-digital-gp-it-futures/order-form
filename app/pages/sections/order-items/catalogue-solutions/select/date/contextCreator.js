import { baseUrl } from '../../../../../../config';
import { addParamsToManifest } from '../../../../../../helpers/contextCreators/addParamsToManifest';
import { generateErrorMap } from '../../../../../../helpers/contextCreators/generateErrorMap';
import { generateErrorSummary } from '../../../../../../helpers/contextCreators/generateErrorSummary';
import { generateQuestions } from '../../../../../../helpers/contextCreators/generateQuestions';

export const getContext = ({
  orderId,
  itemName,
  data,
  errorMap,
  manifest,
  orderType,
  odsCode,
}) => ({
  ...addParamsToManifest(manifest, { itemName, orderId }),
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/${orderType}/select/solution/price/recipients`,
  questions: generateQuestions({
    questions: manifest.questions,
    formData: data,
    errorMap,
  }),
});

export const getErrorContext = ({
  orderId,
  itemName,
  data,
  validationErrors,
  manifest,
}) => {
  const errorMap = generateErrorMap({
    validationErrors,
    errorMessagesFromManifest: manifest.errorMessages,
  });

  const contextWithErrors = getContext({
    orderId,
    itemName,
    data,
    errorMap,
    manifest,
  });

  const errorSummary = generateErrorSummary({ errorMap });
  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
