import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';

describe('associated-services associated-service contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/associated-services`);
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

    it('should return the select associated-service question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectAssociatedService',
            mainAdvice: 'Select Associated Service',
            options: [
              {
                value: 'associated-service-1',
                text: 'Associated Service 1',
              },
              {
                value: 'associated-service-2',
                text: 'Associated Service 2',
              },
            ],
          },
        ],
      };

      const associatedServices = [
        {
          catalogueItemId: 'associated-service-1',
          name: 'Associated Service 1',
        },
        {
          catalogueItemId: 'associated-service-2',
          name: 'Associated Service 2',
        },
      ];

      const context = getContext({ associatedServices });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
