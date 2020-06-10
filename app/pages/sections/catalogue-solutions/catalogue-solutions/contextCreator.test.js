import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

describe('catalogue-solutions contextCreator', () => {
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

    it('should return the insetAdvice', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.orderDescriptionHeading).toEqual(manifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId: 'order-1', orderDescription: 'Some order description' });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the noSolutionsText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.noSolutionsText).toEqual(manifest.noSolutionsText);
    });

    it('should return the catalogueSolutions provided', () => {
      const context = getContext({ orderId: 'order-1', catalogueSolutions: [] });
      expect(context.catalogueSolutions).toEqual([]);
    });

    it('should return the addSolutionButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addSolutionButtonText).toEqual(manifest.addSolutionButtonText);
    });

    it('should return the addSolutionButtonHref', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.addSolutionButtonHref).toEqual(`${baseUrl}/organisation/order-1/catalogue-solutions/select-solution`);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
