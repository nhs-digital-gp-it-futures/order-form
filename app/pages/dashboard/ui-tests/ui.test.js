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

test('should render the incomplete orders table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const incompleteTable = Selector('div[data-test-id="incomplete-orders-table"]');
  const incompleteTableTitle = Selector('h3[data-test-id="incomplete-orders-table-title"]');
  const incompleteColumnHeading1 = incompleteTable.find('[data-test-id="column-heading-0"]');
  const incompleteColumnHeading2 = incompleteTable.find('[data-test-id="column-heading-1"]');
  const incompleteColumnHeading3 = incompleteTable.find('[data-test-id="column-heading-2"]');
  const incompleteColumnHeading4 = incompleteTable.find('[data-test-id="column-heading-3"]');
  const incompleteColumnHeading5 = incompleteTable.find('[data-test-id="column-heading-4"]');

  await t
    .expect(await extractInnerText(incompleteTableTitle)).eql(content.incompleteOrdersTableTitle)
    .expect(await extractInnerText(incompleteColumnHeading1)).eql(content.incompleteOrdersTable.columnInfo[0].data)
    .expect(await extractInnerText(incompleteColumnHeading2)).eql(content.incompleteOrdersTable.columnInfo[1].data)
    .expect(await extractInnerText(incompleteColumnHeading3)).eql(content.incompleteOrdersTable.columnInfo[2].data)
    .expect(await extractInnerText(incompleteColumnHeading4)).eql(content.incompleteOrdersTable.columnInfo[3].data)
    .expect(await extractInnerText(incompleteColumnHeading5)).eql(content.incompleteOrdersTable.columnInfo[4].data);
});

test('should render the incomplete orders table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="incomplete-orders-table"]');
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

test('should render the incomplete orders sorted by descending dateCreated order', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="incomplete-orders-table"]');

  const row1 = table.find('[data-test-id="table-row-0"]');
  const row1OrderId = row1.find('a[data-test-id="order1-id"]');
  const row1DateCreated = row1.find('div[data-test-id="order1-dateCreated"]');

  const row2 = table.find('[data-test-id="table-row-1"]');
  const row2OrderId = row2.find('a[data-test-id="order5-id"]');
  const row2DateCreated = row2.find('div[data-test-id="order5-dateCreated"]');

  const row3 = table.find('[data-test-id="table-row-2"]');
  const row3OrderId = row3.find('a[data-test-id="order4-id"]');
  const row3DateCreated = row3.find('div[data-test-id="order4-dateCreated"]');

  await t
    .expect(await extractInnerText(row1OrderId)).eql('order1')
    .expect(await extractInnerText(row1DateCreated)).eql('6 January 2020')

    .expect(await extractInnerText(row2OrderId)).eql('order5')
    .expect(await extractInnerText(row2DateCreated)).eql('3 January 2020')

    .expect(await extractInnerText(row3OrderId)).eql('order4')
    .expect(await extractInnerText(row3DateCreated)).eql('1 January 2020');
});

test('should render the complete orders table', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const completeTable = Selector('div[data-test-id="complete-orders-table"]');
  const completeTableTitle = Selector('h3[data-test-id="complete-orders-table-title"]');
  const completeColumnHeading1 = completeTable.find('[data-test-id="column-heading-0"]');
  const completeColumnHeading2 = completeTable.find('[data-test-id="column-heading-1"]');
  const completeColumnHeading3 = completeTable.find('[data-test-id="column-heading-2"]');
  const completeColumnHeading4 = completeTable.find('[data-test-id="column-heading-3"]');
  const completeColumnHeading5 = completeTable.find('[data-test-id="column-heading-4"]');
  const completeColumnHeading6 = completeTable.find('[data-test-id="column-heading-5"]');

  await t
    .expect(await extractInnerText(completeTableTitle)).eql(content.completeOrdersTableTitle)
    .expect(await extractInnerText(completeColumnHeading1)).eql(content.completeOrdersTable.columnInfo[0].data)
    .expect(await extractInnerText(completeColumnHeading2)).eql(content.completeOrdersTable.columnInfo[1].data)
    .expect(await extractInnerText(completeColumnHeading3)).eql(content.completeOrdersTable.columnInfo[2].data)
    .expect(await extractInnerText(completeColumnHeading4)).eql(content.completeOrdersTable.columnInfo[3].data)
    .expect(await extractInnerText(completeColumnHeading5)).eql(content.completeOrdersTable.columnInfo[4].data)
    .expect(await extractInnerText(completeColumnHeading6)).eql(content.completeOrdersTable.columnInfo[5].data);
});

test('should render the complete orders table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="complete-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order2-id"]');
  const description = row.find('div[data-test-id="order2-description"]');
  const lastUpdatedBy = row.find('div[data-test-id="order2-lastUpdatedBy"]');
  const dateCompleted = row.find('div[data-test-id="order2-dateCompleted"]');
  const dateCreated = row.find('div[data-test-id="order2-dateCreated"]');
  const automaticallyProcessed = row.find('div[data-test-id="order2-automaticallyProcessed"]');

  await t
    .expect(await extractInnerText(orderId)).eql(mockOrdersData[1].orderId)
    .expect(orderId.getAttribute('href')).eql(`${baseUrl}/organisation/order2/summary`)
    .expect(await extractInnerText(description)).eql(mockOrdersData[1].description)
    .expect(await extractInnerText(lastUpdatedBy)).eql(mockOrdersData[1].lastUpdatedBy)
    .expect(await extractInnerText(dateCompleted)).eql('9 December 2020')
    .expect(await extractInnerText(dateCreated)).eql('9 October 2020')
    .expect(await extractInnerText(automaticallyProcessed)).eql('Yes');
});

test('should render the complete orders sorted by descending dateCompleted order', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="complete-orders-table"]');

  const row1 = table.find('[data-test-id="table-row-0"]');
  const row1OrderId = row1.find('a[data-test-id="order2-id"]');
  const row1DateCompleted = row1.find('div[data-test-id="order2-dateCompleted"]');

  const row2 = table.find('[data-test-id="table-row-1"]');
  const row2OrderId = row2.find('a[data-test-id="order6-id"]');
  const row2DateCompleted = row2.find('div[data-test-id="order6-dateCompleted"]');

  const row3 = table.find('[data-test-id="table-row-2"]');
  const row3OrderId = row3.find('a[data-test-id="order3-id"]');
  const row3DateCompleted = row3.find('div[data-test-id="order3-dateCompleted"]');

  await t
    .expect(await extractInnerText(row1OrderId)).eql('order2')
    .expect(await extractInnerText(row1DateCompleted)).eql('9 December 2020')

    .expect(await extractInnerText(row2OrderId)).eql('order6')
    .expect(await extractInnerText(row2DateCompleted)).eql('6 December 2020')

    .expect(await extractInnerText(row3OrderId)).eql('order3')
    .expect(await extractInnerText(row3DateCompleted)).eql('3 December 2020');
});

test('should navigate to the summary page when an order id is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="complete-orders-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const orderId = row.find('a[data-test-id="order2-id"]');

  await t
    .click(orderId)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order2/summary');
});
