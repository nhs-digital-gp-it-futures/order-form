import newOrderManifest from './neworder/manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order-task-list contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of the new order manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(newOrderManifest.backLinkText);
      expect(context.title).toEqual(newOrderManifest.title);
      expect(context.description).toEqual(newOrderManifest.description);
    });

    it('should return the pageName provided', () => {
      const context = getContext({ pageName: 'some-page-name' });
      expect(context.pageName).toEqual('some-page-name');
    });

    it('should return the backLinkHref', () => {
      const context = getContext({ pageName: 'some-page-name' });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation`);
    });
  });
});
