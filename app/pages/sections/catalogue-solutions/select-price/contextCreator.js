import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const generatePriceList = solutionPricingData => solutionPricingData.prices.map((mappedPrice) => {
  const timeUnitdescription = (mappedPrice.timeUnit || {}).description ? mappedPrice.timeUnit.description : '';
  if (mappedPrice.type === 'flat') {
    return {
      value: `£${mappedPrice.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}`,
      text: `£${mappedPrice.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}`,
    };
  }
  let tieredHtml = '';
  mappedPrice.tiers.forEach((tier) => {
    const tieredRange = tier.end ? `${tier.start} - ${tier.end}` : `${tier.start}+`;
    tieredHtml += `<div>${tieredRange} ${mappedPrice.itemUnit.tierName} £${tier.price} ${mappedPrice.itemUnit.description} ${timeUnitdescription}</div>`;
  });
  return {
    value: tieredHtml,
    html: tieredHtml,
  };
});

const generateQuestionsContext = solutionPricingData => manifest.questions.map(question => ({
  ...question,
  options: generatePriceList(solutionPricingData),
}));

export const getContext = ({ orderId, solutionPricingData }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select-solution`,
  prices: solutionPricingData && generateQuestionsContext(solutionPricingData),
});
