import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

describe('catalogue-solutions select-price contextCreator', () => {
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

    it('should return the listPriceHeading', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.listPriceHeading).toEqual(manifest.listPriceHeading);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
