import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../../config';

jest.mock('../../../getSectionErrorContext', () => ({
  getSectionErrorContext: jest.fn(),
}));

describe('additional-services select-recipient contextCreator', () => {
  describe('getContext', () => {
    it('should return the backLinkText', () => {
      const context = getContext({ orderId: 'order-1' });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
    });

    it('should construct the backLinkHref', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`);
    });

    it('should return the title', () => {
      const itemName = 'Item One';
      const context = getContext({ itemName });
      expect(context.title).toEqual(`${manifest.title} ${itemName}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });

    it('should return the continueButtonText', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
