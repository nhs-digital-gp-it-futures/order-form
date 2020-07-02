import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';
import { questionExtractor } from '../../../../helpers/questionExtractor';

export const populateEstimationPeriod = ((selectedPriceManifest, selectedPrice) => {
  questionExtractor('selectEstimationPeriod', selectedPriceManifest).options.forEach((option, i) => {
    questionExtractor('selectEstimationPeriod', selectedPriceManifest).options[i]
      .checked = option.text.toLowerCase() === selectedPrice
        .timeUnit.description.toLowerCase()
        ? true : undefined;
  });
});

export const populateTable = ((selectedPriceManifest, selectedPrice) => {
  selectedPriceManifest.addPriceTable.data[0][0].question.data = selectedPrice.price;
  selectedPriceManifest.addPriceTable.data[0][1].data = selectedPrice.itemUnit.description;
});

export const formatFormData = ((selectedPriceManifest, populatedData) => {
  questionExtractor('quantity', selectedPriceManifest).data = populatedData.quantity ? populatedData.quantity.trim() : '';
  if (populatedData.price) {
    selectedPriceManifest.addPriceTable.data[0][0].question.data = populatedData.price.trim();
  } else {
    selectedPriceManifest.addPriceTable.data[0][0].question.data = '';
  }
});

// update this take in the common manifest and the priceType manifest
export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  solutionName,
  serviceRecipientName,
  odsCode,
  selectedPrice,
  populatedData,
}) => {
  populateEstimationPeriod(selectedPriceManifest, selectedPrice);
  populateTable(selectedPriceManifest, selectedPrice);
  if (populatedData) formatFormData(selectedPriceManifest, populatedData);

  return ({
    ...commonManifest,
    ...selectedPriceManifest,
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
