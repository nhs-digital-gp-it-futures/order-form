import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../config';
import * as errorContext from '../../../getSectionErrorContext';

jest.mock('../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

const solutionPrices = {
  id: 'sol-1',
  name: 'Solution name',
  prices: [
    {
      priceId: 1,
      type: 'flat',
      currencyCode: 'GBP',
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
      priceId: 2,
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'licence',
        description: 'per licence',
      },
      price: 525.052,
    },
    {
      priceId: 3,
      type: 'tiered',
      currencyCode: 'GBP',
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
    value: 1,
  }, {
    text: '£525.052 per licence ',
    value: 2,
    checked: true,
  }, {
    html: '<div>1 - 10 consultations £700 per consultation per month</div><div>11+ consultations £400 per consultation per month</div>',
    value: 3,
  }],
}];

describe('catalogue-solutions select-price contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', solutionPrices });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, solutionPrices });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', solutionPrices });
      expect(context.title).toEqual(`${manifest.title} Solution name`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', solutionPrices });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1', solutionPrices });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should return the formatted list of questions', () => {
      const context = getContext({ orderId: 'order-1', solutionPrices, selectedPriceId: 2 });
      expect(context.questions).toEqual(returnedPriceArray);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'selectSolutionPrice',
      id: 'SelectSolutionPriceRequired',
    }];

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        solutionPrices,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});
