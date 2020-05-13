import newOrderManifest from './neworder/manifest.json';
import existingOrderManifest from './existingorder/manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order-task-list contextCreator', () => {
  describe('getContext for new order', () => {
    it('should return the contents of the new order manifest', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.backLinkText).toEqual(newOrderManifest.backLinkText);
      expect(context.title).toEqual(newOrderManifest.title);
      expect(context.description).toEqual(newOrderManifest.description);
      expect(context.deleteOrderButton).toEqual(newOrderManifest.deleteOrderButton);
      expect(context.previewOrderButton).toEqual(newOrderManifest.previewOrderButton);
      expect(context.submitOrderButton).toEqual(newOrderManifest.submitOrderButton);
    });

    it('should return the orderId provided', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.orderId).toEqual('neworder');
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });
  });

  describe('getContext for existing order', () => {
    it('should return the contents of the existing order manifest', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.backLinkText).toEqual(existingOrderManifest.backLinkText);
      expect(context.description).toEqual(existingOrderManifest.description);
      expect(context.orderDescriptionTitle).toEqual(existingOrderManifest.orderDescriptionTitle);
      expect(context.deleteOrderButton).toEqual(existingOrderManifest.deleteOrderButton);
      expect(context.previewOrderButton).toEqual(existingOrderManifest.previewOrderButton);
      expect(context.submitOrderButton).toEqual(existingOrderManifest.submitOrderButton);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.title).toEqual('Order order-id');
    });

    it('should return the orderId provided', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.orderId).toEqual('order-id');
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the order description provided', () => {
      const context = getContext({
        orderId: 'order-id',
        orderDescription: 'Some order description',
      });
      expect(context.orderDescription).toEqual('Some order description');
    });
  });
});
