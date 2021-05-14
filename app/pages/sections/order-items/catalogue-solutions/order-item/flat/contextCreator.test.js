import commonManifest from './commonManifest.json';
import flatOnDemandManifest from './ondemand/manifest.json';
import { getContext, getErrorContext } from './contextCreator';

describe('quantity and estimation ondemand form contextCreator', () => {
  describe('getContext', () => {
    const selectedPrice = { price: '100.1', provisioningType: 'Patient', type: 'flat' };

    it('should return the backLinkText', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        selectedPrice,
      });
      expect(context.backLinkText).toEqual(commonManifest.backLinkText);
    });

    it('should return the backLinkHref to catalogue solutions when order item id is not neworderitem', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        orderId: 'order-1',
        selectedPrice,
        odsCode: 'odsCode',
      });
      expect(context.backLinkHref).toEqual('/order/organisation/odsCode/order/order-1/catalogue-solutions/select/solution/price/recipients/date');
    });

    it('should return the backLinkHref to recipient when order item id is neworderitem', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        orderId: 'order-1',
        orderItemId: 'neworderitem',
        selectedPrice,
        odsCode: 'odsCode',
      });
      expect(context.backLinkHref).toEqual('/order/organisation/odsCode/order/order-1/catalogue-solutions/select/solution/price/recipients/date');
    });

    it('should return the title', () => {
      const orderId = 'order-id';
      const itemName = 'item-name';
      const context = getContext({
        commonManifest,
        orderId,
        itemName,
        selectedPriceManifest: flatOnDemandManifest,
        selectedPrice,
      });
      expect(context.title).toEqual(`${commonManifest.title} ${itemName} for ${orderId}`);
    });

    it('should return the description', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        selectedPrice,
      });
      expect(context.description).toEqual(flatOnDemandManifest.description);
    });

    it('should return the continue button', () => {
      const context = getContext({
        commonManifest, selectedPriceManifest: flatOnDemandManifest, selectedPrice,
      });
      expect(context.continueButtonText).toEqual(commonManifest.continueButtonText);
    });

    it('should return questions with errors if answers not input', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        formData: { quantity: [''] },
        selectedPrice,
        errorMap: { quantity: { errorMessages: ['Enter an estimated quantity'] }, selectEstimationPeriod: { errorMessages: ['Select an estimation period'] } },
      });
      expect(context.questions.quantity.error.message).toEqual('Enter an estimated quantity');
      expect(context.questions.selectEstimationPeriod.error.message).toEqual('Select an estimation period');
    });

    it('should return questions with estimation period error if estimation period not selected', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        formData: { quantity: ['78'] },
        selectedPrice,
        errorMap: { selectEstimationPeriod: { errorMessages: ['Select an estimation period'] } },
      });
      expect(context.questions.quantity.error).toEqual(undefined);
      expect(context.questions.selectEstimationPeriod.error.message).toEqual('Select an estimation period');
    });

    it('should return questions with quantity error if quantity not input', () => {
      const context = getContext({
        commonManifest,
        selectedPriceManifest: flatOnDemandManifest,
        formData: { quantity: [''], selectEstimationPeriod: 'month' },
        selectedPrice,
        errorMap: { quantity: { errorMessages: ['Enter an estimated quantity'] } },
      });
      expect(context.questions.quantity.error.message).toEqual('Enter an estimated quantity');
      expect(context.questions.selectEstimationPeriod.error).toEqual(undefined);
    });
  });

  describe('getErrorContext', () => {
    const selectedPrice = { price: '100.1', provisioningType: 'Patient', type: 'flat' };

    it('should return the title', () => {
      const orderId = 'order-id';
      const itemName = 'item-name';
      const context = getErrorContext({
        commonManifest,
        orderId,
        itemName,
        selectedPriceManifest: flatOnDemandManifest,
        selectedPrice,
        validationErrors: [{ field: 'Quantity', id: 'QuantityRequired' }],
      });
      expect(context.title).toEqual(`${commonManifest.title} ${itemName} for ${orderId}`);
    });
  });
});
