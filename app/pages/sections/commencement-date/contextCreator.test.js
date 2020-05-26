import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

const orderId = 'order-id';

describe('commencement-date contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct title with orderId', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual('Commencement date for order-id');
    });
  });
});
