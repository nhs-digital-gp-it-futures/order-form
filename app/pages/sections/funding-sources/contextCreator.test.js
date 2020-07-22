import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

describe('funding sources contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the select recipient question', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectFundingSourcePrice',
            mainAdvice: 'Is General Medical Services (GMS) your only source of funding for this order?',
            options: [{
              value: true,
              text: 'Yes',
            },
            {
              value: false,
              text: 'No',
            }],
          },
        ],
      };

      const context = getContext({});
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the select funding source question with a checked option if selectedAdditionalRecipientId passed in', () => {
      const expectedContext = {
        questions: [
          {
            id: 'selectFundingSourcePrice',
            mainAdvice: 'Is General Medical Services (GMS) your only source of funding for this order?',
            options: [{
              value: true,
              text: 'Yes',
              checked: true,
            },
            {
              value: false,
              text: 'No',
            }],
          },
        ],
      };

      const context = getContext({ fundingSource: true });
      expect(context.questions).toEqual(expectedContext.questions);
    });

    it('should return the saveButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });
});
