import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { baseUrl, orderApiUrl } from '../../../config';
import mockOrdersData from '../../../test-utils/mockData/mockOrders.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/organisations/org-id/orders')
    .reply(200, mockOrdersData);
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Dashboard page')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render dashboard page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="dashboard-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /re-login when click Back', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('http://localhost:3000/re-login');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="dashboard-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('org-name orders');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="dashboard-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render add new order button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="new-order-button"] a');

  await t
    .expect(await extractInnerText(button)).eql(content.newOrderButtonText)
    .expect(button.getAttribute('href')).eql(`${baseUrl}/organisation/neworder`);
});

test('should navigate to the new order page when add new order button is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="new-order-button"] a');

  await t
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/neworder');
});

test('should render the unsubmitted orders table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const unsubmittedTable = Selector('div[data-test-id="unsubmitted-orders-table"]');
  const unsubmittedTableTitle = Selector('h3[data-test-id="unsubmitted-orders-table-title"]');
  const unsubmittedColumnHeading1 = unsubmittedTable.find('[data-test-id="column-heading-0"]');
  const unsubmittedColumnHeading2 = unsubmittedTable.find('[data-test-id="column-heading-1"]');
  const unsubmittedColumnHeading3 = unsubmittedTable.find('[data-test-id="column-heading-2"]');
  const unsubmittedColumnHeading4 = unsubmittedTable.find('[data-test-id="column-heading-3"]');
  const unsubmittedColumnHeading5 = unsubmittedTable.find('[data-test-id="column-heading-4"]');

  await t
    .expect(await extractInnerText(unsubmittedTableTitle)).eql(content.unsubmittedOrdersTableTitle)
    .expect(await extractInnerText(unsubmittedColumnHeading1)).eql(content.columnInfo[0].data)
    .expect(await extractInnerText(unsubmittedColumnHeading2)).eql(content.columnInfo[1].data)
    .expect(await extractInnerText(unsubmittedColumnHeading3)).eql(content.columnInfo[2].data)
    .expect(await extractInnerText(unsubmittedColumnHeading4)).eql(content.columnInfo[3].data)
    .expect(await extractInnerText(unsubmittedColumnHeading5)).eql(content.columnInfo[4].data);
});

test('should render the unsubmitted orders table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="unsubmitted-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order1-id"]');
  const description = row.find('div[data-test-id="order1-description"]');
  const lastUpdatedBy = row.find('div[data-test-id="order1-lastUpdatedBy"]');
  const lastUpdated = row.find('div[data-test-id="order1-lastUpdated"]');
  const dateCreated = row.find('div[data-test-id="order1-dateCreated"]');

  await t
    .expect(await extractInnerText(orderId)).eql(mockOrdersData[0].orderId)
    .expect(orderId.getAttribute('href')).eql(`${baseUrl}/organisation/order1`)
    .expect(await extractInnerText(description)).eql(mockOrdersData[0].description)
    .expect(await extractInnerText(lastUpdatedBy)).eql(mockOrdersData[0].lastUpdatedBy)
    .expect(await extractInnerText(lastUpdated)).eql('6 May 2020')
    .expect(await extractInnerText(dateCreated)).eql('6 January 2020');
});

test('should render the submitted orders table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const submittedTable = Selector('div[data-test-id="submitted-orders-table"]');
  const submittedTableTitle = Selector('h3[data-test-id="submitted-orders-table-title"]');
  const submittedColumnHeading1 = submittedTable.find('[data-test-id="column-heading-0"]');
  const submittedColumnHeading2 = submittedTable.find('[data-test-id="column-heading-1"]');
  const submittedColumnHeading3 = submittedTable.find('[data-test-id="column-heading-2"]');
  const submittedColumnHeading4 = submittedTable.find('[data-test-id="column-heading-3"]');
  const submittedColumnHeading5 = submittedTable.find('[data-test-id="column-heading-4"]');

  await t
    .expect(await extractInnerText(submittedTableTitle)).eql(content.submittedOrdersTableTitle)
    .expect(await extractInnerText(submittedColumnHeading1)).eql(content.columnInfo[0].data)
    .expect(await extractInnerText(submittedColumnHeading2)).eql(content.columnInfo[1].data)
    .expect(await extractInnerText(submittedColumnHeading3)).eql(content.columnInfo[2].data)
    .expect(await extractInnerText(submittedColumnHeading4)).eql(content.columnInfo[3].data)
    .expect(await extractInnerText(submittedColumnHeading5)).eql(content.columnInfo[4].data);
});

test('should render the submitted orders table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="submitted-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order2-id"]');
  const description = row.find('div[data-test-id="order2-description"]');
  const lastUpdatedBy = row.find('div[data-test-id="order2-lastUpdatedBy"]');
  const lastUpdated = row.find('div[data-test-id="order2-lastUpdated"]');
  const dateCreated = row.find('div[data-test-id="order2-dateCreated"]');

  await t
    .expect(await extractInnerText(orderId)).eql(mockOrdersData[1].orderId)
    .expect(orderId.getAttribute('href')).eql(`${baseUrl}/organisation/order2`)
    .expect(await extractInnerText(description)).eql(mockOrdersData[1].description)
    .expect(await extractInnerText(lastUpdatedBy)).eql(mockOrdersData[1].lastUpdatedBy)
    .expect(await extractInnerText(lastUpdated)).eql('9 December 2020')
    .expect(await extractInnerText(dateCreated)).eql('9 October 2020');
});

test('should navigate to the order page when an order id is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="submitted-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order2-id"]');

  await t
    .click(orderId)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order2');
});
