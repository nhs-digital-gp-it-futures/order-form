import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

describe('decription contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of the new order manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.title).toEqual(manifest.title);
      expect(context.description).toEqual(manifest.description);
      expect(context.descriptionQuestion).toEqual({
        question: {
          id: 'description',
          footerAdvice: '(Maximum number of characters 100)',
          rows: 3,
        },
      });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backlinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should add description to the question', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, description: 'a description of the order' });
      expect(context.descriptionQuestion.question.data).toEqual('a description of the order');
    });
  });
});
