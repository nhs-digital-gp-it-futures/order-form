import newOrderManifest from './neworder/manifest.json';
import taskListManifest from './taskListManifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../config';

describe('order-task-list contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of the new order manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(newOrderManifest.backLinkText);
      expect(context.title).toEqual(newOrderManifest.title);
      expect(context.description).toEqual(newOrderManifest.description);
      expect(context.deleteOrderButton).toEqual(newOrderManifest.deleteOrderButton);
      expect(context.previewOrderButton).toEqual(newOrderManifest.previewOrderButton);
      expect(context.submitOrderButton).toEqual(newOrderManifest.submitOrderButton);
    });

    it('should return the contents of the taskListManifest', () => {
      const context = getContext({});
      expect(context.taskList).toEqual(taskListManifest.taskList);
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
