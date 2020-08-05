import manifest from './manifest.json';
import { getDeleteOrderPageContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('delete-order contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getDeleteOrderPageContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const context = getDeleteOrderPageContext({});
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the title', () => {
      const orderId = 'order-1';
      const context = getDeleteOrderPageContext({ orderId });
      expect(context.title).toEqual(`${manifest.title} ${orderId}`);
    });

    it('should return the order description title', () => {
      const context = getDeleteOrderPageContext({});
      expect(context.orderDescriptionTitle).toEqual(`${manifest.orderDescriptionTitle}`);
    });

    it('should return the order description', () => {
      const orderDescription = 'some order desc';
      const context = getDeleteOrderPageContext({ orderDescription });
      expect(context.orderDescription).toEqual(`${orderDescription}`);
    });

    it('should return the description', () => {
      const context = getDeleteOrderPageContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the no button', () => {
      const context = getDeleteOrderPageContext({});
      expect(context.noButtonText).toEqual(manifest.noButtonText);
    });

    it('should return the yes button', () => {
      const context = getDeleteOrderPageContext({});
      expect(context.yesButtonText).toEqual(manifest.yesButtonText);
    });
  });
});
