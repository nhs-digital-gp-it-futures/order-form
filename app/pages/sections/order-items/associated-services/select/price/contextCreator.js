import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateFlatPriceItem = (mappedPrice, timeUnitdescription, selectedPriceId) => ({
  value: mappedPrice.priceId,
  text: `£${mappedPrice.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}`,
  checked: mappedPrice.priceId === selectedPriceId ? true : undefined,
});

const generateTieredPriceItem = (mappedPrice, timeUnitdescription, selectedPriceId) => {
  let tieredHtml = '';
  mappedPrice.tiers.forEach((tier) => {
    const tieredRange = tier.end ? `${tier.start} - ${tier.end}` : `${tier.start}+`;
    tieredHtml += `<div>${tieredRange} ${mappedPrice.itemUnit.tierName} £${tier.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}</div>`;
  });
  return {
    value: mappedPrice.priceId,
    html: tieredHtml,
    checked: mappedPrice.priceId === selectedPriceId ? true : undefined,
  };
};

const generatePriceList = (
  associatedServicePrices,
  selectedPriceId,
) => associatedServicePrices.map((mappedPrice) => {
  const timeUnitdescription = (mappedPrice.timeUnit || {}).description ? mappedPrice.timeUnit.description : '';
  if (mappedPrice.type.toLowerCase() === 'flat') {
    return generateFlatPriceItem(mappedPrice, timeUnitdescription, selectedPriceId);
  }
  return generateTieredPriceItem(mappedPrice, timeUnitdescription, selectedPriceId);
});

const generateQuestionsContext = (associatedServicePrices, selectedPriceId) => (
  manifest.questions.map(question => ({
    ...question,
    options: generatePriceList(associatedServicePrices.prices, selectedPriceId),
  }))
);

export const getContext = ({
  orderId,
  associatedServicePrices,
  selectedPriceId,
  selectedAssociatedServiceName,
}) => ({
  ...manifest,
  title: `${manifest.title} ${selectedAssociatedServiceName}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/associated-services/select/associated-service`,
  questions: associatedServicePrices
    && generateQuestionsContext(associatedServicePrices, selectedPriceId),
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    associatedServicePrices: params.associatedServicePrices,
    selectedAssociatedServiceName: params.selectedAssociatedServiceName,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
