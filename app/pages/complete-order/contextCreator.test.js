import withFundingManifest from './withFundingManifest.json';
import withoutFundingManifest from './withoutFundingManifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('complete order contextCreator', () => {
  describe('getContext - with funding', () => {
    const fundingSource = true;

    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.backLinkText).toEqual(withFundingManifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, fundingSource });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.title).toEqual(`${withFundingManifest.title} order-1?`);
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.description).toEqual(withFundingManifest.description);
    });

    it('should return the order description provided', () => {
      const context = getContext({
        orderId: 'order-id',
        orderDescription: 'Some order description',
        fundingSource,
      });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the completeOrderButtonText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.completeOrderButtonText).toEqual(withFundingManifest.completeOrderButtonText);
    });
  });

  describe('getContext - without funding', () => {
    const fundingSource = false;

    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.backLinkText).toEqual(withoutFundingManifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, fundingSource });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.title).toEqual(`${withoutFundingManifest.title} order-1?`);
    });

    it('should return the page description', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.description).toEqual(withoutFundingManifest.description);
    });

    it('should return the warning advice', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.warningAdvice).toEqual(withoutFundingManifest.warningAdvice);
    });

    it('should return the order description provided', () => {
      const context = getContext({
        orderId: 'order-id',
        orderDescription: 'Some order description',
        fundingSource,
      });
      expect(context.orderDescription).toEqual('Some order description');
    });

    it('should return the completeOrderButtonText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource });
      expect(context.completeOrderButtonText).toEqual(
        withoutFundingManifest.completeOrderButtonText,
      );
    });
  });
});
