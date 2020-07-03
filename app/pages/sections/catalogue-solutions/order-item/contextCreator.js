import { baseUrl } from '../../../../config';
// import { getSectionErrorContext } from '../../getSectionErrorContext';
import { generateErrorMap } from '../../../../helpers/generateErrorMap';
// import { questionExtractor } from '../../../../helpers/questionExtractor';

const populateEstimationPeriodQuestion = ({ questionManifest, timeUnitDescription = '' }) => {
  const options = questionManifest.options.map(option => ({
    ...option,
    checked: option.text.toLowerCase() === timeUnitDescription.toLowerCase()
      ? true : undefined,
  }));

  return ({
    ...questionManifest,
    options,
  });
};

const populateQuestionsWithData = ({ selectedPriceManifest, selectedPrice }) => {
  const questionsWithData = [];

  if (selectedPriceManifest && selectedPriceManifest.questions) {
    selectedPriceManifest.questions.map((question) => {
      if (question.id === 'selectEstimationPeriod') {
        questionsWithData.push(
          populateEstimationPeriodQuestion({
            questionManifest: question,
            timeUnitDescription: selectedPrice && selectedPrice.timeUnit && selectedPrice.timeUnit.description,
          }),
        );
      } else if (question.id === 'quantity') {
        questionsWithData.push({
          ...question,
          data: selectedPrice && selectedPrice.quantity,
        });
      } else {
        questionsWithData.push({
          ...question,
        });
      }
    });
  }

  return questionsWithData;
};

// const populateTable = ((selectedPriceManifest, selectedPrice) => {
//   selectedPriceManifest.addPriceTable.data[0][0].question.data = selectedPrice.price;
//   selectedPriceManifest.addPriceTable.data[0][1].data = selectedPrice.itemUnit.description;
// });

// export const formatFormData = ((selectedPriceManifest, populatedData) => {
//   questionExtractor('quantity', selectedPriceManifest).data = populatedData.quantity ? populatedData.quantity.trim() : '';
//   if (populatedData.price) {
//     selectedPriceManifest.addPriceTable.data[0][0].question.data = populatedData.price.trim();
//   } else {
//     selectedPriceManifest.addPriceTable.data[0][0].question.data = '';
//   }
// });

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

const generateQuestions = ({ questions, formData, errorMap }) => {
  const { questionsAcc: modifiedQuestions } = Object.entries(questions)
    .reduce(({ questionsAcc }, [questionId, questionManifest]) => {
      const questionError = errorMap && errorMap[questionId]
        ? { message: errorMap[questionId].errorMessages.join(', ') }
        : undefined;

      return ({
        questionsAcc: {
          ...questionsAcc,
          [questionId]: {
            ...questionManifest,
            data: formData && formData[questionId] ? formData[questionId] : undefined,
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
  // populatedData,
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
