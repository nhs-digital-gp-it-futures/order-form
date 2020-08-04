import withFundingManifest from './withFundingManifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

describe('Order confirmation contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.backLinkText).toEqual(withFundingManifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-id';
      const context = getContext({ orderId, fundingSource: true });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });

    it('should return the title', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.title).toEqual('Order order-1 completed');
    });

    it('should return the description', () => {
      const context = getContext({ orderId: 'order-1', fundingSource: true });
      expect(context.description).toEqual(withFundingManifest.description);
    });
  });
});
