import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

describe('supplier contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/supplier/search/select`);
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

    it('should return the supplierData provided', () => {
      const supplierData = { name: 'some supp name' };
      const context = getContext({ orderId: 'order-1', supplierData });
      expect(context.supplierData).toEqual(supplierData);
    });

    describe('questions', () => {
      it('should return the firstName question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[0]).toEqual(manifest.questions[0]);
      });

      it('should return the lastName question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[1]).toEqual(manifest.questions[1]);
      });

      it('should return the emailAddress question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[2]).toEqual(manifest.questions[2]);
      });

      it('should return the telephoneNumber question', () => {
        const context = getContext({ orderId: 'order-1' });
        expect(context.questions[3]).toEqual(manifest.questions[3]);
      });
    });

    it('should return the saveButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });
  });
});
