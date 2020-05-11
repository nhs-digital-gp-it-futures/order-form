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
          footerAdvice: '(Maximum number of characters 100)',
          rows: 3,
        },
      });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.backlinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct the saveButtonHref', () => {
      const context = getContext({});
      expect(context.saveButtonHref).toEqual('#');
    });
  });
});
