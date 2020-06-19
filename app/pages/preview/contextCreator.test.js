import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order summary preview contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', orderData: { description: 'Some order description' } });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, orderData: { description: 'Some order description' } });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', orderData: { description: 'Some order description' } });
      expect(context.title).toEqual(`${manifest.title} order-1`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', orderData: { description: 'Some order description' } });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the orderDescriptionHeading', () => {
      const context = getContext({ orderId: 'order-1', orderData: { description: 'Some order description' } });
      expect(context.orderDescriptionHeading).toEqual(manifest.orderDescriptionHeading);
    });

    it('should return the orderDescription provided', () => {
      const context = getContext({ orderId: 'order-1', orderData: { description: 'Some order description' } });
      expect(context.orderDescription).toEqual('Some order description');
    });
  });
});
