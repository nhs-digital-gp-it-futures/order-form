import { componentTester } from '../../test-utils/componentTester';
import manifest from './manifest.json';
import mockOrders from '../../test-utils/mockData/mockOrders.json';
import { baseUrl } from '../../config';

const setup = {
  template: {
    path: 'pages/dashboard/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'org1 orders',
  proxyLinkHref: '/proxy/href',
  newOrderButtonHref: '/organisation/neworder',
  submittedOrders: [mockOrders[0]],
  unsubmittedOrders: [mockOrders[1], mockOrders[2]],
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

    it('should render the data', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="submitted-orders-table"]');
        const row = table.find('[data-test-id="table-row-0"]');
        const orderId = row.find('a[data-test-id="id-order1"]');
        const orderDescription = row.find('div[data-test-id="description-order1"]');
        const lastUpdatedBy = row.find('div[data-test-id="lastUpdatedBy-order1"]');
        const lastUpdated = row.find('div[data-test-id="lastUpdated-order1"]');
        const dateCreated = row.find('div[data-test-id="dateCreated-order1"]');

        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="table"]').length).toEqual(1);
        expect(table.find('[data-test-id="table-headings"]').length).toEqual(1);
        expect(row.length).toEqual(1);
        expect(orderId.length).toEqual(1);
        expect(orderId.text().trim()).toEqual('order1');
        expect(orderId.attr('href')).toEqual(`${baseUrl}/organisation/order1`);
        expect(orderDescription.length).toEqual(1);
        expect(orderDescription.text().trim()).toEqual('a description for order 1');
        expect(lastUpdatedBy.length).toEqual(1);
        expect(lastUpdatedBy.text().trim()).toEqual('Bobby Smithsmith');
        expect(lastUpdated.length).toEqual(1);
        expect(lastUpdated.text().trim()).toEqual('9 December 2020');
        expect(dateCreated.length).toEqual(1);
        expect(dateCreated.text().trim()).toEqual('9 October 2020');
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

    it('should render the data', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="unsubmitted-orders-table"]');
        const row1 = table.find('[data-test-id="table-row-0"]');
        const orderId1 = row1.find('a[data-test-id="id-order2"]');
        const orderDescription1 = row1.find('div[data-test-id="description-order2"]');
        const lastUpdatedBy1 = row1.find('div[data-test-id="lastUpdatedBy-order2"]');
        const lastUpdated1 = row1.find('div[data-test-id="lastUpdated-order2"]');
        const dateCreated1 = row1.find('div[data-test-id="dateCreated-order2"]');
        const row2 = table.find('[data-test-id="table-row-1"]');
        const orderId2 = row2.find('a[data-test-id="id-order3"]');
        const orderDescription2 = row2.find('div[data-test-id="description-order3"]');
        const lastUpdatedBy2 = row2.find('div[data-test-id="lastUpdatedBy-order3"]');
        const lastUpdated2 = row2.find('div[data-test-id="lastUpdated-order3"]');
        const dateCreated2 = row2.find('div[data-test-id="dateCreated-order3"]');

        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="table"]').length).toEqual(1);
        expect(table.find('[data-test-id="table-headings"]').length).toEqual(1);
        expect(row1.length).toEqual(1);
        expect(orderId1.length).toEqual(1);
        expect(orderId1.text().trim()).toEqual('order2');
        expect(orderId1.attr('href')).toEqual(`${baseUrl}/organisation/order2`);
        expect(orderDescription1.length).toEqual(1);
        expect(orderDescription1.text().trim()).toEqual('a description for order 2');
        expect(lastUpdatedBy1.length).toEqual(1);
        expect(lastUpdatedBy1.text().trim()).toEqual('Alice Smith');
        expect(lastUpdated1.length).toEqual(1);
        expect(lastUpdated1.text().trim()).toEqual('9 June 2021');
        expect(dateCreated1.length).toEqual(1);
        expect(dateCreated1.text().trim()).toEqual('9 October 2020');

        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="table"]').length).toEqual(1);
        expect(table.find('[data-test-id="table-headings"]').length).toEqual(1);
        expect(row2.length).toEqual(1);
        expect(orderId2.length).toEqual(1);
        expect(orderId2.text().trim()).toEqual('order3');
        expect(orderId2.attr('href')).toEqual(`${baseUrl}/organisation/order3`);
        expect(orderDescription2.length).toEqual(1);
        expect(orderDescription2.text().trim()).toEqual('a description for order 3');
        expect(lastUpdatedBy2.length).toEqual(1);
        expect(lastUpdatedBy2.text().trim()).toEqual('Bob Smith');
        expect(lastUpdated2.length).toEqual(1);
        expect(lastUpdated2.text().trim()).toEqual('31 December 2020');
        expect(dateCreated2.length).toEqual(1);
        expect(dateCreated2.text().trim()).toEqual('9 May 2020');
      });
    }));
  });
});
