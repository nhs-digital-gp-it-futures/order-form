import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { generateErrorMap } from '../../../helpers/generateErrorMap';

const populateCommencementDateQuestion = ({
  questionManifest, day, month, year,
}) => {
  const commencementDatePopulated = ({
    ...questionManifest,
    data: {
      day,
      month,
      year,
    },
  });
  return commencementDatePopulated;
};

const populateQuestionWithData = ({ questionManifest, formData, questionId }) => {
  if (questionId === 'commencementDate') {
    return populateCommencementDateQuestion({
      questionManifest,
      day: formData[`${questionId}-day`],
      month: formData[`${questionId}-month`],
      year: formData[`${questionId}-year`],
    });
  }

  return {
    data: formData && formData[questionId],
  };
};

const determineFields = (errorMap, questionId) => {
  if (errorMap[questionId].fields) return errorMap[questionId].fields;
  if (questionId === 'commencementDate') return ['day', 'month', 'year'];
  return undefined;
};

const generateQuestions = ({ questions, formData, errorMap }) => {
  const { questionsAcc: modifiedQuestions } = Object.entries(questions)
    .reduce(({ questionsAcc }, [questionId, questionManifest]) => {
      const questionError = errorMap && errorMap[questionId]
        ? {
          message: errorMap[questionId].errorMessages.join(', '),
          fields: determineFields(errorMap, questionId),
        }
        : undefined;

      const questionData = formData
        ? populateQuestionWithData({ questionManifest, formData, questionId })
        : undefined;

      return ({
        questionsAcc: {
          ...questionsAcc,
          [questionId]: {
            ...questionManifest,
            ...questionData,
            error: questionError,
          },
        },
      });
    }, { questionsAcc: {} });

  return modifiedQuestions;
};

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
