import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';
import { formatPrice } from '../../../../../../helpers/common/priceFormatter';

const generateFlatPriceItem = (mappedPrice, timeUnitdescription, selectedPriceId) => ({
  value: mappedPrice.priceId,
  text: `£${formatPrice({ value: mappedPrice.price })} ${mappedPrice.itemUnit.description} ${timeUnitdescription}`,
  checked: mappedPrice.priceId === selectedPriceId ? true : undefined,
});

const generateTieredPriceItem = (mappedPrice, timeUnitdescription, selectedPriceId) => {
  let tieredHtml = '';
  mappedPrice.tiers.forEach((tier) => {
    const tieredRange = tier.end ? `${tier.start} - ${tier.end}` : `${tier.start}+`;
    tieredHtml += `<div>${tieredRange} ${mappedPrice.itemUnit.tierName} £${formatPrice({ value: tier.price, minimumFractionDigits: 0 })} ${mappedPrice.itemUnit.description} ${timeUnitdescription}</div>`;
  });
  return {
    value: mappedPrice.priceId,
    html: tieredHtml,
    checked: mappedPrice.priceId === selectedPriceId ? true : undefined,
  };
};

const generatePriceList = (solutionPrices, selectedPriceId) => solutionPrices.map((mappedPrice) => {
  const timeUnitdescription = (mappedPrice.timeUnit || {}).description ? mappedPrice.timeUnit.description : '';
  if (mappedPrice.type.toLowerCase() === 'flat') {
    return generateFlatPriceItem(mappedPrice, timeUnitdescription, selectedPriceId);
  }
  return generateTieredPriceItem(mappedPrice, timeUnitdescription, selectedPriceId);
});

const generateQuestionsContext = (solutionPrices, selectedPriceId) => (
  manifest.questions.map((question) => ({
    ...question,
    options: generatePriceList(solutionPrices.prices, selectedPriceId),
  }))
);

export const getContext = ({
  orderId, solutionPrices, selectedPriceId, selectedCatalogueItemName,
}) => ({
  ...manifest,
  title: `${manifest.title} ${selectedCatalogueItemName}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`,
  questions: solutionPrices && generateQuestionsContext(solutionPrices, selectedPriceId),
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    solutionPrices: params.solutionPrices,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
