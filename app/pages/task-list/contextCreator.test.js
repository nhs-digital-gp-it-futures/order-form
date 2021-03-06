import commonManifest from './commonManifest.json';
import newOrderManifest from './neworder/manifest.json';
import existingOrderManifest from './existingorder/manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

const odsCode = '03F';
describe('task-list contextCreator', () => {
  describe('getContext for new order', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'neworder' });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'neworder', odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}`);
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
      const orderId = 'neworder';

      const expectedDeleteOrderButtonContext = {
        text: commonManifest.deleteOrderButton.text,
        altText: commonManifest.deleteOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      };

      const context = getContext({ orderId, odsCode });

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

    it('should return the completeOrderButton context', () => {
      const expectedSubmitOrderButtonContext = {
        text: commonManifest.completeOrderButton.text,
        altText: commonManifest.completeOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      };

      const context = getContext({ orderId: 'neworder', odsCode });

      expect(context.completeOrderButton).toEqual(expectedSubmitOrderButtonContext);
    });
  });

  describe('getContext for existing order', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-id' });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ orderId: 'order-id', odsCode });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}`);
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
      const orderId = 'order-id';

      const expectedDeleteOrderButtonContext = {
        text: commonManifest.deleteOrderButton.text,
        href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/delete-order`,
      };

      const context = getContext({ orderId, odsCode });

      expect(context.deleteOrderButton).toEqual(expectedDeleteOrderButtonContext);
    });

    it('should return the previewOrderButton context', () => {
      const expectedPreviewOrderButtonContext = {
        text: commonManifest.previewOrderButton.text,
        href: `${baseUrl}/organisation/${odsCode}/order/order-id/summary`,
      };

      const context = getContext({ orderId: 'order-id', odsCode });

      expect(context.previewOrderButton).toEqual(expectedPreviewOrderButtonContext);
    });

    it('should return the completeOrderButton context', () => {
      const expectedSubmitOrderButtonContext = {
        text: commonManifest.completeOrderButton.text,
        altText: commonManifest.completeOrderButton.disabledAltText,
        href: `${baseUrl}/organisation/${odsCode}/order/order-id/complete-order`,
        disabled: false,
      };

      const context = getContext({ orderId: 'order-id', enableSubmitButton: true, odsCode });

      expect(context.completeOrderButton).toEqual(expectedSubmitOrderButtonContext);
    });
  });
});
