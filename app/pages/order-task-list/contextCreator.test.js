import newOrderManifest from './neworder/manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order-task-list contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of the new order manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(newOrderManifest.backLinkText);
      expect(context.title).toEqual(newOrderManifest.title);
      expect(context.description).toEqual(newOrderManifest.description);
      expect(context.deleteOrderButton).toEqual(newOrderManifest.deleteOrderButton);
      expect(context.previewOrderButton).toEqual(newOrderManifest.previewOrderButton);
      expect(context.submitOrderButton).toEqual(newOrderManifest.submitOrderButton);
    });

    it('should return the orderId provided', () => {
      const context = getContext({ orderId: 'some-order-id' });
      expect(context.orderId).toEqual('some-order-id');
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'some-page-name' });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });
  });
});
