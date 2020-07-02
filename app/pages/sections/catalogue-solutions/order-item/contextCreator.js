import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';
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
            timeUnit: selectedPrice && selectedPrice.timeUnit && selectedPrice.timeUnit.description,
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

// update this take in the common manifest and the priceType manifest
export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  solutionName,
  serviceRecipientName,
  odsCode,
  selectedPrice,
  // populatedData,
}) => {
  // populateEstimationPeriod(selectedPriceManifest, selectedPrice);
  // populateTable(selectedPriceManifest, selectedPrice);
  // if (populatedData) formatFormData(selectedPriceManifest, populatedData);

  return ({
    ...commonManifest,
    questions: populateQuestionsWithData({ selectedPriceManifest, selectedPrice }),
    // addPriceTable: populateTableWithData(selectedPriceManifest, selectedPrice),
    title: `${solutionName} ${commonManifest.title} ${serviceRecipientName} (${odsCode})`,
    deleteButtonHref: '#',
    backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/recipient`,
  });
};

const addErrorsToTableQuestions = ({ updatedManifest, validationErrors }) => {
  const manifestWithErrors = { ...updatedManifest };
  const foundError = validationErrors.find(error => error.field === updatedManifest
    .addPriceTable.data[0][0].question.id);
  if (foundError) {
    const errorMessage = updatedManifest.errorMessages[foundError.id];
    manifestWithErrors.addPriceTable.data[0][0].question.error = { message: errorMessage };
  }

  return manifestWithErrors;
};

export const getErrorContext = async (params) => {
  let updatedManifest = getContext({
    orderId: params.orderId,
    solutionName: params.solutionName,
    serviceRecipientName: params.serviceRecipientName,
    odsCode: params.selectedRecipientId,
    selectedPrice: params.selectedPrice,
    populatedData: params.data,
  });

  updatedManifest = getSectionErrorContext({ ...params, manifest: updatedManifest });

  return {
    ...addErrorsToTableQuestions({ ...params, updatedManifest }),
  };
};
