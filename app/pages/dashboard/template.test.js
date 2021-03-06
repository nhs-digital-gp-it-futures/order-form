import { componentTester } from '../../test-utils/componentTester';
import manifest from './manifest.json';
import mockOrders from '../../test-utils/mockData/mockFormattedOrders.json';
import { baseUrl } from '../../config';

const setup = {
  template: {
    path: 'pages/dashboard/template.njk',
  },
};

const context = {
  ...manifest,
  config: {
    showProxy: 'false',
  },
  title: 'org1',
  proxyLinkHref: '/proxy/href',
  newOrderButtonHref: '/organisation/odsCode/order/neworder',
  completeOrders: { items: [mockOrders[0]] },
  incompleteOrders: { items: [mockOrders[1], mockOrders[2]] },
};

describe('dashboard page', () => {
  it('should render the dashboard page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="dashboard-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(`${context.title} orders`);
    });
  }));

  it('should render the dashboard page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('[data-test-id="dashboard-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  describe('proxy buyer', () => {
    it('should render the dashboard page proxy title', componentTester(setup, (harness) => {
      context.config.showProxy = 'true';
      context.userIsProxy = true;

      harness.request(context, ($) => {
        const title = $('h1[data-test-id="dashboard-page-proxy-title"]');
        expect(title.length).toEqual(1);
        expect(title.text().trim()).toEqual(`Orders for ${context.title}`);
      });
    }));

    it('should render the dashboard page proxy description', componentTester(setup, (harness) => {
      context.config.showProxy = 'true';
      context.userIsProxy = true;

      harness.request(context, ($) => {
        const description = $('[data-test-id="dashboard-page-proxy-description"]');
        expect(description.length).toEqual(1);
        expect(description.text().trim()).toEqual(context.proxy.description);
      });
    }));

    it('should render the dashboard page proxy on behalf of', componentTester(setup, (harness) => {
      context.config.showProxy = 'true';
      harness.request(context, ($) => {
        const description = $('[data-test-id="dashboard-page-proxy-on-behalf"]');
        expect(description.length).toEqual(1);
        expect(description.text().trim()).toEqual(`${context.title} Change organisation`);
      });
    }));
  });

  it('should render the create new order button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="new-order-button"]');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.newOrderButtonText);
      expect(button.find('a').attr('href')).toEqual(context.newOrderButtonHref);
    });
  }));

  describe('incomplete orders table', () => {
    it('should render the table title', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const tableCaption = $('[data-test-id="incomplete-orders-table"] caption');
        expect(tableCaption.length).toEqual(1);
        expect(tableCaption.text().trim()).toEqual(context.incompleteOrdersTableTitle);
      });
    }));

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="incomplete-orders-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual(context.incompleteOrdersTable.columnInfo[0].data);
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual(context.incompleteOrdersTable.columnInfo[1].data);
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual(context.incompleteOrdersTable.columnInfo[2].data);
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual(context.incompleteOrdersTable.columnInfo[3].data);
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual(context.incompleteOrdersTable.columnInfo[4].data);
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="incomplete-orders-table"]');
        const row1 = table.find('[data-test-id="table-row-0"]');
        const orderId1 = row1.find('a[data-test-id="order2-id"]');
        const description1 = row1.find('div[data-test-id="order2-description"]');
        const lastUpdatedBy1 = row1.find('div[data-test-id="order2-lastUpdatedBy"]');
        const lastUpdated1 = row1.find('div[data-test-id="order2-lastUpdated"]');
        const dateCreated1 = row1.find('div[data-test-id="order2-dateCreated"]');
        const row2 = table.find('[data-test-id="table-row-1"]');
        const orderId2 = row2.find('a[data-test-id="order3-id"]');
        const description2 = row2.find('div[data-test-id="order3-description"]');
        const lastUpdatedBy2 = row2.find('div[data-test-id="order3-lastUpdatedBy"]');
        const lastUpdated2 = row2.find('div[data-test-id="order3-lastUpdated"]');
        const dateCreated2 = row2.find('div[data-test-id="order3-dateCreated"]');

        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="table"]').length).toEqual(1);
        expect(table.find('[data-test-id="table-headings"]').length).toEqual(1);
        expect(row1.length).toEqual(1);
        expect(orderId1.length).toEqual(1);
        expect(orderId1.text().trim()).toEqual('order2');
        expect(orderId1.attr('href')).toEqual(`${baseUrl}/organisation/order2`);
        expect(description1.length).toEqual(1);
        expect(description1.text().trim()).toEqual('a description for order 2');
        expect(lastUpdatedBy1.length).toEqual(1);
        expect(lastUpdatedBy1.text().trim()).toEqual('Alice Smith');
        expect(lastUpdated1.length).toEqual(1);
        expect(lastUpdated1.text().trim()).toEqual('9 June 2021');
        expect(dateCreated1.length).toEqual(1);
        expect(dateCreated1.text().trim()).toEqual('9 October 2020');

        expect(row2.length).toEqual(1);
        expect(orderId2.length).toEqual(1);
        expect(orderId2.text().trim()).toEqual('order3');
        expect(orderId2.attr('href')).toEqual(`${baseUrl}/organisation/order3`);
        expect(description2.length).toEqual(1);
        expect(description2.text().trim()).toEqual('a description for order 3');
        expect(lastUpdatedBy2.length).toEqual(1);
        expect(lastUpdatedBy2.text().trim()).toEqual('Bob Smith');
        expect(lastUpdated2.length).toEqual(1);
        expect(lastUpdated2.text().trim()).toEqual('31 December 2020');
        expect(dateCreated2.length).toEqual(1);
        expect(dateCreated2.text().trim()).toEqual('9 May 2020');
      });
    }));
  });

  describe('complete orders table', () => {
    it('should render the table title', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const tableCaption = $('[data-test-id="complete-orders-table"] caption');
        expect(tableCaption.length).toEqual(1);
        expect(tableCaption.text().trim()).toEqual(context.completeOrdersTableTitle);
      });
    }));

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="complete-orders-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual(context.completeOrdersTable.columnInfo[0].data);
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual(context.completeOrdersTable.columnInfo[1].data);
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual(context.completeOrdersTable.columnInfo[2].data);
        expect(table.find('[data-test-id="column-heading-3"]').text().trim()).toEqual(context.completeOrdersTable.columnInfo[3].data);
        expect(table.find('[data-test-id="column-heading-4"]').text().trim()).toEqual(context.completeOrdersTable.columnInfo[4].data);
        expect(table.find('[data-test-id="column-heading-5"]').text().trim()).toEqual(context.completeOrdersTable.columnInfo[5].data);
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="complete-orders-table"]');
        const row = table.find('[data-test-id="table-row-0"]');
        const orderId = row.find('a[data-test-id="order1-id"]');
        const description = row.find('div[data-test-id="order1-description"]');
        const lastUpdatedBy = row.find('div[data-test-id="order1-lastUpdatedBy"]');
        const lastUpdated = row.find('div[data-test-id="order1-lastUpdated"]');
        const dateCreated = row.find('div[data-test-id="order1-dateCreated"]');
        const automaticallyProcessed = row.find('div[data-test-id="order1-automaticallyProcessed"]');

        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="table"]').length).toEqual(1);
        expect(table.find('[data-test-id="table-headings"]').length).toEqual(1);
        expect(row.length).toEqual(1);
        expect(orderId.length).toEqual(1);
        expect(orderId.text().trim()).toEqual('order1');
        expect(orderId.attr('href')).toEqual(`${baseUrl}/organisation/order1`);
        expect(description.length).toEqual(1);
        expect(description.text().trim()).toEqual('a description for order 1');
        expect(lastUpdatedBy.length).toEqual(1);
        expect(lastUpdatedBy.text().trim()).toEqual('Bobby Smithsmith');
        expect(lastUpdated.length).toEqual(1);
        expect(lastUpdated.text().trim()).toEqual('9 December 2020');
        expect(dateCreated.length).toEqual(1);
        expect(dateCreated.text().trim()).toEqual('9 October 2020');
        expect(automaticallyProcessed.length).toEqual(1);
        expect(automaticallyProcessed.text().trim()).toEqual('Yes');
      });
    }));
  });
});
