import { baseUrl } from '../../../../config';
import { generateErrorMap } from '../../../../helpers/generateErrorMap';

const populateRadioQuestion = ({ questionManifest, selectedValue = '' }) => {
  const populatedOptions = questionManifest.options.map(option => ({
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

const generateAddPriceTable = ({
  addPriceTable, price, itemUnitDescription, timeUnitDescription = '', errorMap,
}) => {
  const columns = [];

  columns.push({
    ...addPriceTable.cellInfo.price,
    question: {
      ...addPriceTable.cellInfo.price.question,
      data: price,
      error: errorMap && errorMap.price
        ? { message: errorMap.price.errorMessages.join(', ') }
        : undefined,
    },
  });

  columns.push({
    ...addPriceTable.cellInfo.unitOfOrder,
    data: `${itemUnitDescription} ${timeUnitDescription}`,
  });

  const items = [columns];
  return ({
    ...addPriceTable,
    items,
  });
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

const generateQuestions = ({ questions, formData, errorMap }) => {
  const { questionsAcc: modifiedQuestions } = Object.entries(questions)
    .reduce(({ questionsAcc }, [questionId, questionManifest]) => {
      const questionError = errorMap && errorMap[questionId]
        ? {
          message: errorMap[questionId].errorMessages.join(', '),
          fields: determineFields({ errorMap, questionId, questionType: questionManifest.type }),
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

const generateErrorSummary = ({ errorMap }) => (
  Object.entries(errorMap).map(([questionId, errors]) => ({
    href: `#${questionId}`,
    text: errors.errorMessages.join(', '),
  }))
);

export const getErrorContext = (params) => {
  const errorMap = generateErrorMap({
    validationErrors: params.validationErrors,
    errorMessagesFromManifest: params.selectedPriceManifest.errorMessages,
  });

  const contextWithErrors = getContext({
    commonManifest: params.commonManifest,
    selectedPriceManifest: params.selectedPriceManifest,
    orderId: params.orderId,
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
