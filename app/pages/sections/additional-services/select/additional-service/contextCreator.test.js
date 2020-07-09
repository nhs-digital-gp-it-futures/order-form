import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../config';
import * as errorContext from '../../../getSectionErrorContext';

jest.mock('../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('additional-services additional-service contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/additional-services`);
    });

    it('should return the title', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.title).toEqual(`${manifest.title} ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the select additional-service question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectAdditionalService',
            mainAdvice: 'Select Additional Service',
            options: [
              {
                value: 'additional-service-1',
                text: 'Additional Service 1',
              },
              {
                value: 'additional-service-2',
                text: 'Additional Service 2',
              },
            ],
          },
        ],
      };

      const additionalServices = [
        {
          additionalServiceId: 'additional-service-1',
          name: 'Additional Service 1',
        },
        {
          additionalServiceId: 'additional-service-2',
          name: 'Additional Service 2',
        },
      ];

      const context = getContext({ additionalServices });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return select additional service question with the selectedAdditionalService checked', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectAdditionalService',
            mainAdvice: 'Select Additional Service',
            options: [
              {
                value: 'additional-service-1',
                text: 'Additional Service 1',
              },
              {
                value: 'additional-service-2',
                text: 'Additional Service 2',
                checked: true,
              },
            ],
          },
        ],
      };

      const additionalServices = [
        {
          additionalServiceId: 'additional-service-1',
          name: 'Additional Service 1',
        },
        {
          additionalServiceId: 'additional-service-2',
          name: 'Additional Service 2',
        },
      ];

      const selectedAdditionalServiceId = 'additional-service-2';

      const context = getContext({ additionalServices, selectedAdditionalServiceId });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return no selected additional service question when selectedAdditionalService undefined', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectAdditionalService',
            mainAdvice: 'Select Additional Service',
            options: [
              {
                value: 'additional-service-1',
                text: 'Additional Service 1',
              },
              {
                value: 'additional-service-2',
                text: 'Additional Service 2',
              },
            ],
          },
        ],
      };

      const additionalServices = [
        {
          additionalServiceId: 'additional-service-1',
          name: 'Additional Service 1',
        },
        {
          additionalServiceId: 'additional-service-2',
          name: 'Additional Service 2',
        },
      ];

      const selectedAdditionalServiceId = undefined;

      const context = getContext({ additionalServices, selectedAdditionalServiceId });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });

  describe('getErrorContext', () => {
    const mockValidationErrors = [{
      field: 'selectAdditionalService',
      id: 'SelectAdditionalServiceRequired',
    }];

    const additionalServices = [
      { id: 'additional-service-1', name: 'Additional Service 1' },
      { id: 'additional-service-2', name: 'Additional Service 2' },
    ];

    afterEach(() => {
      errorContext.getSectionErrorContext.mockReset();
    });

    it('should call getSectionErrorContext with correct params', () => {
      errorContext.getSectionErrorContext
        .mockResolvedValueOnce();

      const params = {
        orderId: 'order-id',
        validationErrors: mockValidationErrors,
        additionalServices,
      };

      getErrorContext(params);
      expect(errorContext.getSectionErrorContext.mock.calls.length).toEqual(1);
    });
  });
});
