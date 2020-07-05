import { baseUrl } from '../../../../config';
import { generateErrorMap } from '../../../../helpers/generateErrorMap';

const populateEstimationPeriodQuestion = ({ questionManifest, timeUnitDescription = '' }) => {
  const populatedOptions = questionManifest.options.map(option => ({
    ...option,
    checked: option.value.toLowerCase() === timeUnitDescription.toLowerCase()
      ? true : undefined,
  }));

  return {
    options: populatedOptions,
  };
};

const populateDeliveryDateQuestion = ({
  questionManifest, day, month, year,
}) => {
  const plannedDeliveryDatePopulated = ({
    ...questionManifest,
    data: {
      day,
      month,
      year,
    },
  });
  return plannedDeliveryDatePopulated;
};

const generateAddPriceTable = ({
  addPriceTable, price, itemUnitDescription, errorMap,
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
    data: itemUnitDescription,
  });

  const items = [columns];
  return ({
    ...addPriceTable,
    items,
  });
};

const populateQuestionWithData = ({ questionManifest, formData, questionId }) => {
  if (questionId === 'selectEstimationPeriod') {
    return populateEstimationPeriodQuestion({
      questionManifest,
      timeUnitDescription: formData && formData[questionId],
    });
  }
  if (questionId === 'deliveryDate') {
    return populateDeliveryDateQuestion({
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

const generateQuestions = ({ questions, formData, errorMap }) => {
  const { questionsAcc: modifiedQuestions } = Object.entries(questions)
    .reduce(({ questionsAcc }, [questionId, questionManifest]) => {
      const questionError = errorMap && errorMap[questionId]
        ? {
          message: errorMap[questionId].errorMessages.join(', '),
          fields: errorMap[questionId].fields,
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
    itemUnitDescription: selectedPrice && selectedPrice.itemUnit.description,
    errorMap,
  }),
  deleteButtonHref: '#',
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/recipient`,
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
