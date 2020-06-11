import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';
import { getSectionErrorContext } from '../../../getSectionErrorContext';

const generateFlatPriceItem = (mappedPrice, timeUnitdescription) => ({
  value: mappedPrice.priceId,
  text: `£${mappedPrice.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}`,
});

const generateTieredPriceItem = (mappedPrice, timeUnitdescription) => {
  let tieredHtml = '';
  mappedPrice.tiers.forEach((tier) => {
    const tieredRange = tier.end ? `${tier.start} - ${tier.end}` : `${tier.start}+`;
    tieredHtml += `<div>${tieredRange} ${mappedPrice.itemUnit.tierName} £${tier.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}</div>`;
  });
  return {
    value: mappedPrice.priceId,
    html: tieredHtml,
  };
};

const generatePriceList = solutionPrices => solutionPrices.map((mappedPrice) => {
  const timeUnitdescription = (mappedPrice.timeUnit || {}).description ? mappedPrice.timeUnit.description : '';
  if (mappedPrice.type === 'flat') {
    return generateFlatPriceItem(mappedPrice, timeUnitdescription);
  }
  return generateTieredPriceItem(mappedPrice, timeUnitdescription);
});

const generateQuestionsContext = solutionPrices => manifest.questions.map(question => ({
  ...question,
  options: generatePriceList(solutionPrices.prices),
}));

export const getContext = ({ orderId, solutionPrices }) => ({
  ...manifest,
  title: `${manifest.title} ${solutionPrices.name}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`,
  questions: solutionPrices && generateQuestionsContext(solutionPrices),
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
