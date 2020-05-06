import { componentTester } from '../../test-utils/componentTester';
import context from './manifest.json';

const setup = {
  template: {
    path: 'pages/dashboard/template.njk',
  },
};

describe('dashboard page', () => {
  it('should render the dashboard page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('[data-test-id="dashboard-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));
});
