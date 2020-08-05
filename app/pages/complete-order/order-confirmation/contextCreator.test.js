import withFundingManifest from './withFundingManifest.json';
import withoutFundingManifest from './withoutFundingManifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

describe('Order confirmation contextCreator', () => {
  describe('getContext - with funding', () => {
    const fundingSource = true;
    const manifest = withFundingManifest;
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, fundingSource });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.title).toEqual('Order order-1 completed');
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.description).toEqual(manifest.description);
    });
  });

  describe('getContext - without funding', () => {
    const fundingSource = false;
    const manifest = withoutFundingManifest;
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, fundingSource });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.title).toEqual('Order order-1 completed');
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the order summary button text', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.orderSummaryButtonText).toEqual(manifest.orderSummaryButtonText);
    });

    it('should return the order summary advice', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.orderSummaryAdvice).toEqual(manifest.orderSummaryAdvice);
    });
  });
});
