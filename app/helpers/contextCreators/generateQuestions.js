import { formatPrice } from '../common/priceFormatter';

const populateRadioQuestion = ({ questionManifest, selectedValue = '' }) => {
  const populatedOptions = questionManifest.options.map((option) => ({
    ...option,
    checked: option.value.toLowerCase() === selectedValue.toLowerCase()
      ? true : undefined,
  }));

  return {
    options: populatedOptions,
  };
};

const populateDateQuestion = ({
  questionManifest, day, month, year,
}) => {
  const dateQuestionPopulated = ({
    ...questionManifest,
    data: {
      day,
      month,
      year,
    },
  });
  return dateQuestionPopulated;
};

const populateQuestionWithData = ({ questionManifest, formData, questionId }) => {
  if (questionManifest.type === 'radio') {
    return populateRadioQuestion({
      questionManifest,
      selectedValue: formData && formData[questionId],
    });
  }
  if (questionManifest.type === 'date') {
    return populateDateQuestion({
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

const determineFields = ({ errorMap, questionId, questionType }) => {
  if (errorMap[questionId].fields) return errorMap[questionId].fields;
  if (questionType === 'date') return ['day', 'month', 'year'];
  return undefined;
};

export const generateQuestions = ({ questions, formData, errorMap }) => {
  const { questionsAcc: modifiedQuestions } = Object.entries(questions)
    .reduce(({ questionsAcc }, [questionId, questionManifest]) => {
      const formattedData = formData && {
        ...formData,
        price: formData.price
          ? formatPrice(
            { value: formData.price, minimumFractionDigits: 0, maximumFractionDigits: 20 },
          ) : undefined,
      };

      const questionError = errorMap && errorMap[questionId]
        ? {
          message: errorMap[questionId].errorMessages.join(', '),
          fields: determineFields({ errorMap, questionId, questionType: questionManifest.type }),
        }
        : undefined;

      const questionData = formData
        ? populateQuestionWithData({ questionManifest, formData: formattedData, questionId })
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
