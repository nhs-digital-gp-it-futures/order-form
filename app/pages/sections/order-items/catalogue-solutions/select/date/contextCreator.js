import manifest from './manifest.json';
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
}) => ({
  ...addParamsToManifest(manifest, { itemName, orderId }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients`,
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
  });

  const errorSummary = generateErrorSummary({ errorMap });
  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
