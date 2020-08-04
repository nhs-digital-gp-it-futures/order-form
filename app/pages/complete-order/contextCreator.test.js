import withFundingManifest from './withFundingManifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('Complete order contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.backLinkText).toEqual(withFundingManifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, fundingSource: true });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.title).toEqual('Complete order order-1?');
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.description).toEqual(withFundingManifest.description);
    });

    it('should return the order description provided', () => {
      const context = getContext({
        orderId: 'order-id',
        orderDescription: 'Some order description',
        fundingSource: true,
      });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the completeOrderButtonText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.completeOrderButtonText).toEqual(withFundingManifest.completeOrderButtonText);
    });
  });
});
