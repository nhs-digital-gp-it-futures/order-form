import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../config';

jest.mock('buying-catalogue-library');


describe('decription contextCreator', () => {
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

    it('should return the supplierName question', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.questions[0]).toEqual(manifest.questions[0]);
    });

    it('should return the searchButtonText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.searchButtonText).toEqual(manifest.searchButtonText);
    });
  });
});
