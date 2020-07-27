import commonManifest from './commonManifest.json';
import newOrderManifest from './neworder/manifest.json';
import existingOrderManifest from './existingorder/manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('task-list contextCreator', () => {
  describe('getContext for new order', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the orderId provided', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.orderId).toEqual('neworder');
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.title).toEqual(newOrderManifest.title);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.description).toEqual(newOrderManifest.description);
    });

    it('should return the deleteOrderButton context', () => {
      const expectedDeleteOrderButtonContext = {
        text: commonManifest.deleteOrderButton.text,
        altText: commonManifest.deleteOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      };

      const context = getContext({ orderId: 'neworder' });

      expect(context.deleteOrderButton).toEqual(expectedDeleteOrderButtonContext);
    });

    it('should return the previewOrderButton context', () => {
      const expectedPreviewOrderButtonContext = {
        text: commonManifest.previewOrderButton.text,
        altText: commonManifest.previewOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      };

      const context = getContext({ orderId: 'neworder' });

      expect(context.previewOrderButton).toEqual(expectedPreviewOrderButtonContext);
    });

    it('should return the submitOrderButton context', () => {
      const expectedSubmitOrderButtonContext = {
        text: commonManifest.submitOrderButton.text,
        altText: commonManifest.submitOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      };

      const context = getContext({ orderId: 'neworder' });

      expect(context.submitOrderButton).toEqual(expectedSubmitOrderButtonContext);
    });
  });

  describe('getContext for existing order', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the orderId provided', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.orderId).toEqual('order-id');
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.title).toEqual('Order order-id');
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.description).toEqual(existingOrderManifest.description);
    });

    it('should return the orderDescriptionTitle', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.orderDescriptionTitle).toEqual(existingOrderManifest.orderDescriptionTitle);
    });


    it('should return the order description provided', () => {
      const context = getContext({
        orderId: 'order-id',
        orderDescription: 'Some order description',
      });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the deleteOrderButton context', () => {
      const expectedDeleteOrderButtonContext = {
        text: commonManifest.deleteOrderButton.text,
        href: '#',
      };

      const context = getContext({ orderId: 'order-id' });

      expect(context.deleteOrderButton).toEqual(expectedDeleteOrderButtonContext);
    });

    it('should return the previewOrderButton context', () => {
      const expectedPreviewOrderButtonContext = {
        text: commonManifest.previewOrderButton.text,
        href: `${baseUrl}/organisation/order-id/preview`,
      };

      const context = getContext({ orderId: 'order-id' });

      expect(context.previewOrderButton).toEqual(expectedPreviewOrderButtonContext);
    });

    it('should return the submitOrderButton context', () => {
      const expectedSubmitOrderButtonContext = {
        text: commonManifest.submitOrderButton.text,
        altText: commonManifest.submitOrderButton.disabledAltText,
        href: '#',
        disabled: false,
      };

      const context = getContext({ orderId: 'order-id', enableSubmitButton: true });

      expect(context.submitOrderButton).toEqual(expectedSubmitOrderButtonContext);
    });
  });
});
