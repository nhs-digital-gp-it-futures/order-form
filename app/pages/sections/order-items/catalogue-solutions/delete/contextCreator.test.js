import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../../config';

describe('delete-order contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const orderItemId = 'order-item-1';
      const context = getContext({ orderId, orderItemId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/catalogue-solutions/${orderItemId}`);
    });

    it('should return the title', () => {
      const orderId = 'order-1';
      const solutionName = 'solution-name';
      const context = getContext({ orderId, solutionName });
      expect(context.title).toEqual('Delete solution-name from order-1?');
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

    it('should return the no button', () => {
      const orderId = 'order-1';
      const orderItemId = 'order-item-1';
      const context = getContext({ orderId, orderItemId });
      expect(context.noButtonText).toEqual(manifest.noButtonText);
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/catalogue-solutions/${orderItemId}`);
    });

    it('should return the yes button', () => {
      const context = getContext({});
      expect(context.yesButtonText).toEqual(manifest.yesButtonText);
    });
  });
});
