import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

describe('call-off-ordering-party contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.orgNameHeading).toEqual(manifest.orgNameHeading);
      expect(context.odsCodeHeading).toEqual(manifest.odsCodeHeading);
      expect(context.orgAddressHeading).toEqual(manifest.orgAddressHeading);
      expect(context.saveButtonText).toEqual(manifest.saveButtonText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.backlinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct title with orderId', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId });
      expect(context.title).toEqual('Call-off Ordering Party information for order-id');
    });
  });
});
