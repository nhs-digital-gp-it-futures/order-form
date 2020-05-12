import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from '../../test-utils/helper';
import content from './manifest.json';
import { baseUrl, orderApiUrl } from '../../config';
import mockOrdersData from '../../test-utils/mockData/mockOrders.json';

const pageUrl = 'http://localhost:1234/organisation';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/organisation/undefined/orders')
    .reply(200, mockOrdersData);
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Dashboard page')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render dashboard page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="dashboard-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /re-login when click Back', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .expect(goBackLink.getAttribute('href')).eql('http://localhost:3000/re-login');
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="dashboard-page-title"]');

  await t
    .expect(title.exists).ok()
    // TODO: change value when orgName is in claims
    .expect(await extractInnerText(title)).eql('undefined orders');
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="dashboard-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render add new order button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="new-order-button"] a');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.newOrderButtonText)
    .expect(button.getAttribute('href')).eql(`${baseUrl}/organisation/neworder`);
});

test('should navigate to the new order page when add new order button is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="new-order-button"] a');

  await t
    .expect(button.exists).ok()
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/neworder');
});

test('should render the proxy link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const link = Selector('div[data-test-id="proxy-link"] a');

  await t
    .expect(link.exists).ok()
    .expect(await extractInnerText(link)).eql(content.proxyLinkText)
    .expect(link.getAttribute('href')).eql('#');
});

// TODO: Change the expected location
test('should navigate to ? page when proxy link is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const link = Selector('div[data-test-id="proxy-link"] a');

  await t
    .expect(link.exists).ok()
    .click(link)
    .expect(getLocation()).eql('http://localhost:1234/organisation#');
});

test('should render the unsubmitted orders table', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const unsubmittedTable = Selector('div[data-test-id="unsubmitted-orders-table"]');
  const unsubmittedTableTitle = Selector('h3[data-test-id="unsubmitted-orders-table-title"]');
  const unsubmittedColumnHeading1 = unsubmittedTable.find('[data-test-id="column-heading-0"]');
  const unsubmittedColumnHeading2 = unsubmittedTable.find('[data-test-id="column-heading-1"]');
  const unsubmittedColumnHeading3 = unsubmittedTable.find('[data-test-id="column-heading-2"]');
  const unsubmittedColumnHeading4 = unsubmittedTable.find('[data-test-id="column-heading-3"]');
  const unsubmittedColumnHeading5 = unsubmittedTable.find('[data-test-id="column-heading-4"]');

  await t
    .expect(unsubmittedTable.exists).ok()
    .expect(unsubmittedTableTitle.exists).ok()
    .expect(await extractInnerText(unsubmittedTableTitle)).eql(content.unsubmittedOrdersTableTitle)
    .expect(unsubmittedColumnHeading1.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading1)).eql(content.columnInfo[0].data)
    .expect(unsubmittedColumnHeading2.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading2)).eql(content.columnInfo[1].data)
    .expect(unsubmittedColumnHeading3.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading3)).eql(content.columnInfo[2].data)
    .expect(unsubmittedColumnHeading4.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading4)).eql(content.columnInfo[3].data)
    .expect(unsubmittedColumnHeading5.exists).ok()
    .expect(await extractInnerText(unsubmittedColumnHeading5)).eql(content.columnInfo[4].data);
});

test('should render the unsubmitted orders table content', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="unsubmitted-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order1-id"]');
  const orderDescription = row.find('div[data-test-id="order1-description"]');
  const lastUpdatedBy = row.find('div[data-test-id="order1-lastUpdatedBy"]');
  const lastUpdated = row.find('div[data-test-id="order1-lastUpdated"]');
  const dateCreated = row.find('div[data-test-id="order1-dateCreated"]');

  await t
    .expect(row.exists).ok()
    .expect(orderId.exists).ok()
    .expect(await extractInnerText(orderId)).eql(mockOrdersData[0].orderId)
    .expect(orderId.getAttribute('href')).eql(`${baseUrl}/organisation/order1`)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).eql(mockOrdersData[0].orderDescription)
    .expect(lastUpdatedBy.exists).ok()
    .expect(await extractInnerText(lastUpdatedBy)).eql(mockOrdersData[0].lastUpdatedBy)
    .expect(lastUpdated.exists).ok()
    .expect(await extractInnerText(lastUpdated)).eql('6 May 2020')
    .expect(dateCreated.exists).ok()
    .expect(await extractInnerText(dateCreated)).eql('6 January 2020');
});

test('should render the submitted orders table', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const submittedTable = Selector('div[data-test-id="submitted-orders-table"]');
  const submittedTableTitle = Selector('h3[data-test-id="submitted-orders-table-title"]');
  const submittedColumnHeading1 = submittedTable.find('[data-test-id="column-heading-0"]');
  const submittedColumnHeading2 = submittedTable.find('[data-test-id="column-heading-1"]');
  const submittedColumnHeading3 = submittedTable.find('[data-test-id="column-heading-2"]');
  const submittedColumnHeading4 = submittedTable.find('[data-test-id="column-heading-3"]');
  const submittedColumnHeading5 = submittedTable.find('[data-test-id="column-heading-4"]');

  await t
    .expect(submittedTable.exists).ok()
    .expect(submittedTableTitle.exists).ok()
    .expect(await extractInnerText(submittedTableTitle)).eql(content.submittedOrdersTableTitle)
    .expect(submittedColumnHeading1.exists).ok()
    .expect(await extractInnerText(submittedColumnHeading1)).eql(content.columnInfo[0].data)
    .expect(submittedColumnHeading2.exists).ok()
    .expect(await extractInnerText(submittedColumnHeading2)).eql(content.columnInfo[1].data)
    .expect(submittedColumnHeading3.exists).ok()
    .expect(await extractInnerText(submittedColumnHeading3)).eql(content.columnInfo[2].data)
    .expect(submittedColumnHeading4.exists).ok()
    .expect(await extractInnerText(submittedColumnHeading4)).eql(content.columnInfo[3].data)
    .expect(submittedColumnHeading5.exists).ok()
    .expect(await extractInnerText(submittedColumnHeading5)).eql(content.columnInfo[4].data);
});

test('should render the submitted orders table content', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="submitted-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order2-id"]');
  const orderDescription = row.find('div[data-test-id="order2-description"]');
  const lastUpdatedBy = row.find('div[data-test-id="order2-lastUpdatedBy"]');
  const lastUpdated = row.find('div[data-test-id="order2-lastUpdated"]');
  const dateCreated = row.find('div[data-test-id="order2-dateCreated"]');

  await t
    .expect(row.exists).ok()
    .expect(orderId.exists).ok()
    .expect(await extractInnerText(orderId)).eql(mockOrdersData[1].orderId)
    .expect(orderId.getAttribute('href')).eql(`${baseUrl}/organisation/order2`)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).eql(mockOrdersData[1].orderDescription)
    .expect(lastUpdatedBy.exists).ok()
    .expect(await extractInnerText(lastUpdatedBy)).eql(mockOrdersData[1].lastUpdatedBy)
    .expect(lastUpdated.exists).ok()
    .expect(await extractInnerText(lastUpdated)).eql('9 December 2020')
    .expect(dateCreated.exists).ok()
    .expect(await extractInnerText(dateCreated)).eql('9 October 2020');
});

test('should navigate to the order page when an order id is clicked', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="submitted-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order2-id"]');

  await t
    .expect(table.exists).ok()
    .expect(row.exists).ok()
    .expect(orderId.exists).ok()
    .click(orderId)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order2');
});
