import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { generateErrorMap } from '../../../helpers/contextCreators/generateErrorMap';
import { generateQuestions } from '../../../helpers/contextCreators/generateQuestions';
import { generateErrorSummary } from '../../../helpers/contextCreators/generateErrorSummary';

export const getContext = ({ odsCode, orderId, data, errorMap }) => ({
  ...manifest,
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
  title: `${manifest.title} ${orderId}`,
  questions: generateQuestions({
    questions: manifest.questions,
    formData: data,
    errorMap,
  }),
});

export const getErrorContext = ({ validationErrors, orderId, data }) => {
  const errorMap = generateErrorMap({
    validationErrors,
    errorMessagesFromManifest: manifest.errorMessages,
  });

  const contextWithErrors = getContext({
    orderId,
    data,
    errorMap,
  });

  const errorSummary = generateErrorSummary({ errorMap });

  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
