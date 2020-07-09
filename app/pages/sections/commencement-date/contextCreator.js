import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { generateErrorMap } from '../../../helpers/generateErrorMap';
import { generateQuestions } from '../../../helpers/generateQuestions';
import { generateErrorSummary } from '../../../helpers/generateErrorSummary';

export const getContext = ({ orderId, data, errorMap }) => ({
  ...manifest,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
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
