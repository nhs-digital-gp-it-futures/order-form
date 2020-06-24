import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

export const populateEstimationPeriod = ((selectedPrice) => {
  manifest.questions.estimationPeriod.options.forEach((option, i) => {
    manifest.questions.estimationPeriod.options[i]
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
  manifest.questions.quantity.data = populatedData.quantity ? populatedData.quantity.trim() : '';
});

export const getContext = ({
  orderId, solutionName, serviceRecipientName, odsCode, selectedPrice, populatedData = null,
}) => {
  populateEstimationPeriod(selectedPrice);
  populateTable(selectedPrice);
  // if (populatedData) formatFormData(populatedData);

  return ({
    ...manifest,
    title: `${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`,
    deleteButtonHref: '#',
    backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/recipient`,
  });
};

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    selectedSolutionName: params.selectedSolutionName,
    selectedRecipientName: params.selectedRecipientName,
    selectedPrice: params.selectedPrice,
    populatedData: params.data,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
