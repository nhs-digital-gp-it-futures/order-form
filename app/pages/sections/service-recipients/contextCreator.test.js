import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

const orderId = 'order-id';

describe('service-recipients contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
      expect(context.selectDeselectButton.selectText)
        .toEqual(manifest.selectDeselectButton.selectText);
      expect(context.selectDeselectButton.deselectText)
        .toEqual(manifest.selectDeselectButton.deselectText);
      expect(context.organisationHeading).toEqual(manifest.organisationHeading);
      expect(context.odsCodeHeading).toEqual(manifest.odsCodeHeading);
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should construct the title', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual('Service Recipients for order-id');
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });
  });
});
