import { createTestHarness } from '../../test-utils/testHarness';
import context from './manifest.json';

const setup = {
  template: {
    path: 'pages/dashboard/template.njk',
  },
};

describe('dashboard page', () => {
  it('should render the dashboard text', createTestHarness(setup, (harness) => {
    harness.request(context, ($) => {
      const dashboardText = $('[data-test-id="dashboard-text"]');
      expect(dashboardText.text().trim()).toEqual('Dashboard');
    });
  }));
});
