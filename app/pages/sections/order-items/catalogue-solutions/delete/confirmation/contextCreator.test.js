import manifest from './manifest.json';
import { getContext } from './contextCreator';

describe('delete-catalogue-confirmation contextCreator', () => {
  describe('getContext', () => {
      it('should return the title', () => {
      const orderId = 'order-1';
      const solutionName = 'solution-1';
      const context = getContext({ orderId, solutionName });
      expect(context.title).toEqual('solution-1 deleted from order-1');
    });

    it('should return the order description title', () => {
      const context = getContext({});
      expect(context.description).toEqual(`${manifest.description}`);
    });

    it('should return the continue button', () => {
      const context = getContext({});
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });
  });
});
