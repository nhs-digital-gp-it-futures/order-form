import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { generateErrorMap } from '../../../helpers/generateErrorMap';
import { generateQuestions } from '../../../helpers/generateQuestions';

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

const generateErrorSummary = ({ errorMap }) => (
  Object.entries(errorMap).map(([questionId, errors]) => ({
    href: `#${questionId}`,
    text: errors.errorMessages.join(', '),
  }))
);

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
