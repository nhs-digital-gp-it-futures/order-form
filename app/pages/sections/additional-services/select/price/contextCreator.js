import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';
import { getSectionErrorContext } from '../../../getSectionErrorContext';

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
  additionalServicePrices,
  selectedPriceId,
) => additionalServicePrices.map((mappedPrice) => {
  const timeUnitdescription = (mappedPrice.timeUnit || {}).description ? mappedPrice.timeUnit.description : '';
  if (mappedPrice.type.toLowerCase() === 'flat') {
    return generateFlatPriceItem(mappedPrice, timeUnitdescription, selectedPriceId);
  }
  return generateTieredPriceItem(mappedPrice, timeUnitdescription, selectedPriceId);
});

const generateQuestionsContext = (additionalServicePrices, selectedPriceId) => (
  manifest.questions.map(question => ({
    ...question,
    options: generatePriceList(additionalServicePrices.prices, selectedPriceId),
  }))
);

export const getContext = ({
  orderId,
  additionalServicePrices,
  selectedPriceId,
  selectedAdditionalServiceName,
}) => ({
  ...manifest,
  title: `${manifest.title} ${selectedAdditionalServiceName}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service`,
  questions: additionalServicePrices
    && generateQuestionsContext(additionalServicePrices, selectedPriceId),
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    additionalServicePrices: params.additionalServicePrices,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
