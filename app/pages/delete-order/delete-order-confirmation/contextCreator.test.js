import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

describe('delete-order-confirmation contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({});
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the title', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.title).toEqual('Order order-1 deleted');
    });

    it('should return the order description title', () => {
      const context = getContext({});
      expect(context.orderDescriptionTitle).toEqual(`${manifest.orderDescriptionTitle}`);
    });

    it('should return the order description', () => {
      const orderDescription = 'some order desc';
      const context = getContext({ orderDescription });
      expect(context.orderDescription).toEqual(`${orderDescription}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });
  });
});
