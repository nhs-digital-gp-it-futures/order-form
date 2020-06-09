import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

const solutionPricingData = {
  id: 'supp-1',
  name: 'name',
  prices: [
    {
      type: 'flat',
      currencyCode: 'GBP', // ISO Currency Code
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    },
    {
      type: 'flat',
      currencyCode: 'GBP', // ISO Currency Code
      itemUnit: {
        name: 'licence',
        description: 'per licence',
      },
      price: 525.052,
    },
    {
      type: 'tiered',
      currencyCode: 'GBP', // ISO Currency Code
      itemUnit: {
        name: 'consultation',
        description: 'per consultation',
        tierName: 'consultations',
      },
      timeUnit: {
        name: 'month',
        description: 'per month',
      },
      tieringPeriod: 3,
      tiers: [
        {
          start: 1,
          end: 10,
          price: 700.0,
        },
        {
          start: 11,
          price: 400.0,
        },
      ],
    },
  ],
};

const returnedPriceArray = [{
  id: 'selectSolutionPrice',
  mainAdvice: 'Select list price',
  options: [{
    text: '£1.64 per patient per year',
    value: '£1.64 per patient per year',
  }, {
    text: '£525.052 per licence ',
    value: '£525.052 per licence ',
  }, {
    html: '<div>1 - 10 consultations £700 per consultation per month</div><div>11+ consultations £400 per consultation per month</div>',
    value: '<div>1 - 10 consultations £700 per consultation per month</div><div>11+ consultations £400 per consultation per month</div>',
  }],
}];

describe('catalogue-solutions select-price contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/catalogue-solutions/select-solution`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should return the formatted list of prices', () => {
      const context = getContext({ orderId: 'order-1', solutionPricingData });
      expect(context.prices).toEqual(returnedPriceArray);
    });
  });
});
