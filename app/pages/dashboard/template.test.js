import { componentTester } from '../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/dashboard/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'org1 orders',
};

describe('dashboard page', () => {
  it('should render the dashboard page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="dashboard-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the dashboard page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="dashboard-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the create new order button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="new-order-button"]');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.newOrderButtonText);
      expect(button.find('a').attr('href')).toEqual(context.newOrderButtonHref);
    });
  }));

  it('should render the proxy link', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const link = $('div[data-test-id="proxy-link"] a');
      expect(link.length).toEqual(1);
      expect(link.text().trim()).toEqual(context.proxyLinkText);
      expect(link.attr('href')).toEqual(context.proxyLinkHref);
    });
  }));

  describe('unsubmitted orders table', () => {
    it('should render the table title', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const tableTitle = $('h3[data-test-id="unsubmitted-orders-table-title"]');
        expect(tableTitle.length).toEqual(1);
        expect(tableTitle.text().trim()).toEqual(context.unsubmittedOrdersTableTitle);
      });
    }));

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="submitted-orders-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual(context.columnInfo[0].data);
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual(context.columnInfo[1].data);
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual(context.columnInfo[2].data);
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual(context.columnInfo[3].data);
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual(context.columnInfo[4].data);
      });
    }));
  });

  describe('submitted orders table', () => {
    it('should render the table title', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const tableTitle = $('h3[data-test-id="submitted-orders-table-title"]');
        expect(tableTitle.length).toEqual(1);
        expect(tableTitle.text().trim()).toEqual(context.submittedOrdersTableTitle);
      });
    }));

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="submitted-orders-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual(context.columnInfo[0].data);
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual(context.columnInfo[1].data);
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual(context.columnInfo[2].data);
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual(context.columnInfo[3].data);
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual(context.columnInfo[4].data);
      });
    }));
  });
});
