import commonManifest from './commonManifest.json';
import flatOnDemandManifest from './ondemand/manifest.json';
import { getContext } from './contextCreator';

describe('quantity and estimation ondemand form contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref to catalogue solutions when order item id is not neworderitem', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        orderId: 'order-1',
      });
      expect(context.backLinkHref).toEqual('/order/organisation/order-1/catalogue-solutions/select/solution/price/recipients/date');
    });

    it('should return the backLinkHref to recipient when order item id is neworderitem', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        orderId: 'order-1',
        orderItemId: 'neworderitem',

      });
      expect(context.backLinkHref).toEqual('/order/organisation/order-1/catalogue-solutions/select/solution/price/recipients/date');
    });

    it('should return the title', () => {
      const orderId = 'order-id';
      const itemName = 'item-name';
      const context = getContext({
        commonManifest, orderId, itemName, selectedPriceManifest: flatOnDemandManifest,
      });
      expect(context.title).toEqual(`${commonManifest.title} ${itemName} for ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
      });
      expect(context.description).toEqual(flatOnDemandManifest.description);
    });
    it('should return the continue button', () => {
      const context = getContext({
        commonManifest, selectedPriceManifest: flatOnDemandManifest,
      });
      expect(context.continueButtonText).toEqual(commonManifest.continueButtonText);
    });
  });
});
