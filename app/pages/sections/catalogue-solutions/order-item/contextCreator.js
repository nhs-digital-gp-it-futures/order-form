import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';
import { questionExtractor } from '../../../../helpers/questionExtractor';

export const populateEstimationPeriod = ((selectedPrice) => {
  questionExtractor('selectEstimationPeriod', manifest).options.forEach((option, i) => {
    questionExtractor('selectEstimationPeriod', manifest).options[i]
      .checked = option.text.toLowerCase() === selectedPrice
        .timeUnit.description.toLowerCase()
        ? true : undefined;
  });
});

export const populateTable = ((selectedPrice) => {
  manifest.addPriceTable.data[0][0].question.data = selectedPrice.price;
  manifest.addPriceTable.data[0][1].data = selectedPrice.itemUnit.description;
});

export const formatFormData = ((populatedData) => {
  questionExtractor('quantity', manifest).data = populatedData.quantity ? populatedData.quantity.trim() : '';
  if (populatedData.price) {
    manifest.addPriceTable.data[0][0].question.data = populatedData.price.trim();
  } else {
    manifest.addPriceTable.data[0][0].question.data = '';
  }
});

export const getContext = ({
  orderId, solutionName, serviceRecipientName, odsCode, selectedPrice, populatedData = null,
}) => {
  populateEstimationPeriod(selectedPrice);
  populateTable(selectedPrice);
  if (populatedData) formatFormData(populatedData);

  return ({
    ...manifest,
    title: `${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`,
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
