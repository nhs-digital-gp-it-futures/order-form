import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';
import * as errorContext from '../../../../getSectionErrorContext';

jest.mock('../../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

const additionalServicePrices = {
  id: 'additional-service-1',
  name: 'Additional Service name',
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
        description: 'per month',
      },
      price: 199.64,
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
        name: 'bed',
        description: 'per bed',
        tierName: 'beds',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      tieringPeriod: 3,
      tiers: [
        {
          start: 1,
          end: 999,
          price: 123.450,
        },
        {
          start: 1000,
          price: 49.99,
        },
      ],
    },
  ],
};

const returnedPriceArray = [{
  id: 'selectAdditionalServicePrice',
  mainAdvice: 'Select list price',
  options: [{
    text: '£199.64 per patient per month',
    value: 1,
  }, {
    text: '£525.052 per licence ',
    value: 2,
    checked: true,
  }, {
    html: '<div>1 - 999 beds £123.45 per bed per year</div><div>1000+ beds £49.99 per bed per year</div>',
    value: 3,
  }],
}];

describe('additional-services select-price contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', additionalServicePrices });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, additionalServicePrices });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/additional-services/select/additional-service`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', additionalServicePrices });
      expect(context.title).toEqual(`${manifest.title} Additional Service name`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', additionalServicePrices });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1', additionalServicePrices });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should return the formatted list of questions', () => {
      const context = getContext({ orderId: 'order-1', additionalServicePrices, selectedPriceId: 2 });
      expect(context.questions).toEqual(returnedPriceArray);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'selectAdditionalServicePrice',
      id: 'SelectAdditionalServicePriceRequired',
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
        additionalServicePrices,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});
