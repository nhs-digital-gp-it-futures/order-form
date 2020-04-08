import { createTestHarness } from '../../test-utils/testHarness';
import context from './manifest.json';

const setup = {
  template: {
    path: 'pages/index/template.njk',
  },
};

describe('index page', () => {
  it('should render the index page title', createTestHarness(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('[data-test-id="index-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));
});
