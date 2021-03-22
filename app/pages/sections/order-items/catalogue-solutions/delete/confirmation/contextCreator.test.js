import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';

describe('delete-catalogue-confirmation contextCreator', () => {
  describe('getContext', () => {
      it('should return the title', () => {
      const orderId = 'order-1';
      const context = getContext({ orderId });
      expect(context.title).toEqual('Catalogue order-1 deleted');
    });

    it('should return the order description title', () => {
      const context = getContext({});
      expect(context.orderDescriptionTitle).toEqual(`${manifest.orderDescriptionTitle}`);
    });

    it('should return the description', () => {
      const context = getContext({});
      expect(context.description).toEqual(manifest.description);
    });
  });
});
